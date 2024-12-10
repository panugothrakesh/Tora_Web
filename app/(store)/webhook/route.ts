import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        console.log("Webhook received");
        const body = await request.text();
        console.log("Webhook body:", body);
        
        const headersList = await headers();
        const signature = headersList.get("x-razorpay-signature");
        console.log("Webhook signature:", signature);

        if (!signature) {
            return NextResponse.json({ error: "Signature missing" }, { status: 400 });
        }

        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error("Webhook secret is not set");
            return NextResponse.json({ error: "Webhook secret is not set" }, { status: 400 });
        }

        // Verify signature
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);
        console.log("Full webhook event:", event);

        if (event.event === "payment.captured") {
            console.log("Payment captured event received");
            const payment = event.payload.payment.entity;
            
            // Extract order information from the payment entity
            const order = {
                id: payment.order_id,
                receipt: payment.description.split('Order #')[1],
                notes: payment.notes,
                amount: payment.amount,
                currency: payment.currency
            };

            // Add debug logging
            console.log("Payment notes:", payment.notes);
            console.log("Shipping address from notes:", payment.notes.shippingAddress);
            console.log("Payment method from notes:", payment.notes.paymentMethod);

            if (!order) {
                console.error("Order data is missing in the webhook payload. Full payload:", event.payload);
                return NextResponse.json({ error: "Order data is missing" }, { status: 400 });
            }

            console.log("Payment details:", payment);
            console.log("Order details:", order);
            console.log("Shipping Address:", order.notes.shippingAddress);
            
            try {
                // Parse the order items from notes
                const orderItems = JSON.parse(order.notes.orderItems);
                console.log("Parsed order items:", orderItems);

                // Calculate original total price
                const originalPrice = orderItems.reduce((total: number, item: { price: number; quantity: number }) => 
                    total + (item.price * item.quantity), 0);

                // Calculate actual amount paid (converting from smallest currency unit)
                const amountPaid = order.amount / 100;

                // Calculate discount amount
                const discountAmount = originalPrice - amountPaid;
                console.log("Price calculation:", { originalPrice, amountPaid, discountAmount });

                const sanityOrder = await createOrderInSanity({
                    orderNumber: order.receipt,
                    RazorpayCheckoutId: order.id,
                    RazorpayPaymentIntentId: payment.id,
                    RazorpayCustomerId: order.notes.customerId,
                    clerkUserId: order.notes.clerkUserId,
                    name: order.notes.customerName,
                    email: order.notes.customerEmail,
                    products: orderItems,
                    totalAmount: amountPaid,
                    currency: order.currency,
                    status: 'paid',
                    orderDate: new Date().toISOString(),
                    discountAmount: discountAmount,
                    paymentMethod: 'online',
                    shippingAddress: JSON.parse(order.notes.shippingAddress)
                });

                console.log("Order created in Sanity:", sanityOrder);
                return NextResponse.json({ 
                    message: "Order created successfully", 
                    orderId: sanityOrder._id 
                });
            } catch (err) {
                console.error("Detailed error creating order:", err);
                return NextResponse.json(
                    { error: "Error creating order in Sanity", details: err }, 
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

async function createOrderInSanity(orderData: {
    orderNumber: string;
    RazorpayCheckoutId: string;
    RazorpayPaymentIntentId: string;
    RazorpayCustomerId: string;
    clerkUserId: string;
    name: string;
    email: string;
    products: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    currency: string;
    status: 'paid';
    orderDate: string;
    discountAmount: number;
    paymentMethod: string;
    shippingAddress: {
        firstName: string;
        lastName: string;
        mobile: string;
        address1: string;
        address2?: string;
        landmark?: string;
        pincode: string;
    };
}) {
    if (!orderData.orderNumber || !orderData.RazorpayCustomerId || !orderData.products.length) {
        throw new Error('Missing required order data');
    }

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
    } = orderData;

    const sanityProducts = products.map((item) => ({
        _key: crypto.randomUUID(),
        product: {
            _type: "reference",
            _ref: item.id,
        },
        quantity: item.quantity,
    }));
    console.log("Sanity products:", sanityProducts);

    console.log("orderData:", orderData);

    const order = await backendClient.create({
        _type: "order",
        orderNumber,
        clerkUserId,
        name,
        email,
        products: sanityProducts,
        totalAmount,
        currency: currency,
        status: status,
        orderDate: orderDate,
        paymentMethod: paymentMethod,
        RazorpayCheckoutId,
        RazorpayCustomerId,
        RazorpayPaymentIntentId,
        shippingAddress: shippingAddress
    });
    console.log("Order created in Sanity:", order);

    return order;
}

