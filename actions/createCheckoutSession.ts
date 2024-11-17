'use server';

import razorpay from "@/lib/razorpay";
import { BasketItem } from "@/store/store";

export type Metadata = {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    clerkUserId: string;
    customerPhone?: string;
    discountAmount?: number;
}

export type GroupedBasketItems = {
    product: BasketItem['product'];
    quantity: number;
}

export type RazorpayOrderResponse = {
    id: string;
    amount: number;
    currency: string;
    key: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerId: string;
}

export async function createCheckoutSession(
    items: GroupedBasketItems[],
    metadata: Metadata
): Promise<RazorpayOrderResponse> {
    try {
        const itemsWithoutPrice = items.filter((item) => !item.product.price);
        if (itemsWithoutPrice.length > 0) {
            throw new Error("Some items do not have a price");
        }

        // Search for existing customer by email
        let customerId: string;
        const customers = await razorpay.customers.all({
            count: 100,
            skip: 0
        });

        const existingCustomer = customers.items.find(
            customer => customer.email === metadata.customerEmail
        );

        if (!existingCustomer) {
            const newCustomer = await razorpay.customers.create({
                name: metadata.customerName,
                email: metadata.customerEmail,
                contact: metadata.customerPhone || "",
                notes: {
                    clerkUserId: metadata.clerkUserId
                }
            });
            customerId = newCustomer.id;
        } else {
            customerId = existingCustomer.id;
            await razorpay.customers.edit(customerId, {
                name: metadata.customerName,
                contact: metadata.customerPhone || existingCustomer.contact
            });
        }

        const totalAmount = items.reduce((total, item) => 
            total + (item.product.price || 0) * item.quantity, 0);

        // Apply discount if exists
        const discountedAmount = metadata.discountAmount 
            ? totalAmount * (1 - metadata.discountAmount / 100)
            : totalAmount;

        const session = await razorpay.orders.create({
            amount: Math.round(discountedAmount * 100),
            currency: "INR",
            receipt: metadata.orderNumber,
            notes: {
                customerName: metadata.customerName,
                customerEmail: metadata.customerEmail,
                clerkUserId: metadata.clerkUserId,
                customerId: customerId,
                orderItems: JSON.stringify(items.map(item => ({
                    id: item.product._id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price
                }))),
            },
            payment_capture: true
        });
        
        return {
            id: session.id,
            amount: Number(session.amount),
            currency: session.currency,
            key: process.env.RAZORPAY_KEY_ID || '',
            orderNumber: metadata.orderNumber,
            customerName: metadata.customerName,
            customerEmail: metadata.customerEmail,
            customerPhone: metadata.customerPhone,
            customerId: customerId
        };
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}