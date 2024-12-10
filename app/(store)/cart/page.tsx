'use client'
import { createCheckoutSession, Metadata } from '@/actions/createCheckoutSession';
import AddAddressPopup from '@/components/AddAddressPopup';
import AddToBasketButton from '@/components/AddToBasketButton';
import Loader from '@/components/ui/Loader';
import { imageUrl } from '@/lib/imageUrl';
import { useBasketStore } from '@/store/store';
import { useUser, SignInButton, useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface RazorpayWindow extends Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
    };
    handler: (response: RazorpayResponse) => void;
    modal: {
        ondismiss: () => void;
    };
    theme: {
        color: string;
    };
}

interface RazorpayInstance {
    open: () => void;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

function CartPage() {
    const groupedItems = useBasketStore((state) => state.getGroupedItems());
    const [showPopup, setShowPopup] = useState(false);
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const addresses = useBasketStore((state) => state.addresses);
    const removeAddress = useBasketStore((state) => state.removeAddress);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    console.log(user);
    if (!isClient || !groupedItems) return <Loader />

    if (groupedItems.length == 0) {
        return (
            <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Basket</h1>
                <p className=" @text-gray-600 text-lg">Your basket is empty.</p>
            </div>
        )
    }

    const handleCheckout = async () => {
        try {
            setIsLoading(true);
            const metadata: Metadata = {
                orderNumber: crypto.randomUUID(),
                customerName: user?.fullName ?? "Unknown",
                customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
                clerkUserId: user!.id,
            };

            const order = await createCheckoutSession(groupedItems, metadata);

            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "TORA",
                description: `Order #${order.orderNumber}`,
                order_id: order.id,
                prefill: {
                    name: order.customerName,
                    email: order.customerEmail,
                },
                handler: function (response: RazorpayResponse) {
                    // Handle successful payment
                    console.log("Payment successful:", response);
                    // You can redirect to a success page or show a success message
                    window.location.href = `/success?session_id=${response.razorpay_payment_id}&orderNumber=${order.orderNumber}`;
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                },
                theme: {
                    color: "#3B82F6" // matches your blue-500 color
                }
            };

            const razorpay = new ((window as unknown as RazorpayWindow).Razorpay)(options);
            razorpay.open();

        } catch (error) {
            console.error("Error during checkout:", error);
            alert("Failed to initiate checkout. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-2xl font-bold mb-4">Your Basket</h1>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-0">
                <div className="flex-grow">
                    {groupedItems?.map((item) => (
                        <div
                            key={item.product._id}
                            className="mb-4 p-4 border rounded flex items-center justify-between">
                            <div className="flex items-center cursor-pointer flex-1 min-w-0" onClick={() => router.push(`/product/${item.product.slug?.current}`)}>
                                <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 mr-4">
                                    {item.product.images && (
                                        <Image
                                            src={imageUrl(item.product.images[0]).url()}
                                            alt={item.product.name ?? "Product image"}
                                            className="w-full h-full object-cover rounded"
                                            width={96}
                                            height={96}
                                        />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg sm:text-xl font-semibold truncate">
                                        {item.product.name}
                                    </h2>
                                    <p className="text-sm sm:text-base">
                                        {((item.product.price ?? 0) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center ml-4 flex-shrink-0">
                                <AddToBasketButton product={item.product} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-64 lg:h-8">
                    {/* Spacer for fixed checkout on mobile */}
                </div>
            </div>
            <div className='flex flex-col items-center justify-between w-full gap-4'>
                <div className='w-full grid grid-cols-2 max-w-6xl border mx-auto bottom-0'>
                    <div className="w-full h-fit bg-white p-4 pr-2 rounded">
                        <h2 className="text-xl font-semibold">Select Address to Deliver</h2>
                        <div className="mt-4 space-y-2">
                            {addresses.length > 0 ? (
                                addresses.map((address, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                                        <span>{`${address.firstName} ${address.lastName}, ${address.address1}, ${address.pincode}`}</span>
                                        <button className="text-red-500" onClick={() => removeAddress(index)}>Remove</button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center p-4 border rounded">
                                    <p>No addresses available.</p>
                                </div>
                            )}
                            <button onClick={() => setShowPopup(true)} className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Add New Address
                            </button>
                            {showPopup && <AddAddressPopup onClose={() => setShowPopup(false)} />}
                        </div>
                    </div>
                    <div className="w-full h-fit bg-white p-4 pl-2 rounded">
                        <h2 className="text-xl font-semibold">Select Payment Mode</h2>
                        <div className="mt-4 space-x-2 flex justify-between items-center">
                            <div className="flex items-center justify-between p-4 border rounded w-full">
                                <span>Pay Online</span>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded w-full">
                                <span>Cash On Delivery</span>
                            </div>
                        </div>
                            <button onClick={() => setShowPopup(true)} className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Add New Address
                            </button>
                    </div>
                </div>

                <div className='w-full max-w-6xl mx-auto bottom-0'>
                    <div className="w-full h-fit bg-white p-6 border rounded mr-12">
                        <h2 className="text-xl font-semibold">Order Summary</h2>
                        <div className="mt-4 space-y-2">
                            <p className="flex justify-between">
                                <span>Items:</span>
                                <span>
                                    {groupedItems.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            </p>
                            <p className="flex justify-between text-2xl font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>
                                    ₹{useBasketStore.getState().getTotalPrice().toFixed(2)}
                                </span>
                            </p>
                        </div>

                        {isSignedIn ? (
                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {isLoading ? "Processing..." : "Checkout"}
                            </button>
                        ) : (
                            <SignInButton mode="modal">
                                <button
                                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Sign in to Checkout
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage