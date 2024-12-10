import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import crypto from 'crypto';

interface CartItem {
    product: {
        _id: string;
    };
    quantity: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderNumber,
            clerkUserId,
            customerName,
            customerEmail,
            products,
            totalAmount,
            selectedAddress
        } = body;

        const sanityProducts = products.map((item: CartItem) => ({
            _key: crypto.randomUUID(),
            product: {
                _type: "reference",
                _ref: item.product._id,
            },
            quantity: item.quantity,
        }));

        const order = await backendClient.create({
            _type: "order",
            orderNumber,
            clerkUserId,
            name: customerName,
            email: customerEmail,
            products: sanityProducts,
            totalAmount,
            currency: "INR",
            status: 'pending',
            orderDate: new Date().toISOString(),
            paymentMethod: 'cod',
            shippingAddress: selectedAddress
        });

        return NextResponse.json({ 
            message: "COD order created successfully", 
            orderId: order._id,
            orderNumber: order.orderNumber
        });
    } catch (error) {
        console.error("Error creating COD order:", error);
        return NextResponse.json({ error: "Failed to create COD order" }, { status: 500 });
    }
}
