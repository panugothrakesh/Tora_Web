import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import crypto from 'crypto';

interface OrderProduct {
    id: string;
    name: string;
    quantity: number;
    price: number;
    size: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Received order request body:', body);

        const {
            orderNumber,
            RazorpayCheckoutId,
            RazorpayPaymentIntentId,
            RazorpayCustomerId,
            clerkUserId,
            name,
            email,
            products,
            totalAmount,
            currency,
            status,
            orderDate,
            paymentMethod,
            shippingAddress
        } = body;

        console.log('Processing products:', products);

        const sanityProducts = products.map((item: OrderProduct) => {
            console.log('Processing individual item:', {
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                size: item.size
            });
            return {
                _key: crypto.randomUUID(),
                product: {
                    _type: "reference",
                    _ref: item.id,
                },
                quantity: item.quantity,
                size: item.size || 'M',
            };
        });
        console.log('Final sanity products:', sanityProducts);

        const order = await backendClient.create({
            _type: "order",
            orderNumber,
            clerkUserId,
            name,
            email,
            products: sanityProducts,
            totalAmount,
            currency,
            status,
            orderDate,
            paymentMethod,
            RazorpayCheckoutId,
            RazorpayCustomerId,
            RazorpayPaymentIntentId,
            shippingAddress
        });

        console.log('Created order in Sanity:', order);

        return NextResponse.json({ 
            message: "Order created successfully", 
            orderId: order._id,
            orderNumber: order.orderNumber
        });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order" }, 
            { status: 500 }
        );
    }
} 