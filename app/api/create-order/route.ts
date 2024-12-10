import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import crypto from 'crypto';

interface OrderProduct {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
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

        const sanityProducts = products.map((item: OrderProduct) => ({
            _key: crypto.randomUUID(),
            product: {
                _type: "reference",
                _ref: item.id,
            },
            quantity: item.quantity,
        }));

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