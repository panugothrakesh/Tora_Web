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
import Modal from '@/components/Modal';

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

const CartPage: React.FC = () => {
    const groupedItems = useBasketStore((state) => state.getGroupedItems());
    const [showPopup, setShowPopup] = useState(false);
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const addresses = useBasketStore((state) => state.addresses);
    const removeAddress = useBasketStore((state) => state.removeAddress);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
    const [selectedPaymentMode, setSelectedPaymentMode] = useState<'online' | 'cod'>('cod');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

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
        if (!user) return;

        if (addresses.length === 0) {
            setModalMessage("Please add an address before proceeding to checkout.");
            setModalOpen(true);
            return;
        }

        if (!selectedPaymentMode) {
            setModalMessage("Please select a payment mode before proceeding to checkout.");
            setModalOpen(true);
            return;
        }

        setIsLoading(true);
        const orderNumber = crypto.randomUUID();

        try {
            if (selectedPaymentMode === 'cod') {
                const response = await fetch('/api/create-cod-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        orderNumber,
                        clerkUserId: user.id,
                        customerName: user.fullName,
                        customerEmail: user.emailAddresses[0].emailAddress,
                        products: groupedItems,
                        totalAmount: useBasketStore.getState().getTotalPrice(),
                        selectedAddress: addresses[selectedAddressIndex],
                        paymentMethod: selectedPaymentMode
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || "Failed to create order");
                }

                const data = await response.json();
                window.location.href = `/success?orderNumber=${data.orderNumber}`;
            } else {
                const metadata: Metadata = {
                    orderNumber: crypto.randomUUID(),
                    customerName: user?.fullName ?? "Unknown",
                    customerEmail: user?.emailAddresses[0].emailAddress ?? "Unknown",
                    clerkUserId: user.id,
                    shippingAddress: addresses[selectedAddressIndex],
                    paymentMethod: 'online'
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
                    handler: async function (razorpayResponse: RazorpayResponse) {
                        try {
                            // Post the order to Sanity
                            const orderData = {
                                orderNumber: order.orderNumber,
                                RazorpayCheckoutId: order.id,
                                RazorpayPaymentIntentId: razorpayResponse.razorpay_payment_id,
                                RazorpayCustomerId: order.customerId,
                                clerkUserId: user.id,
                                name: order.customerName,
                                email: order.customerEmail,
                                products: groupedItems.map(item => ({
                                    id: item.product._id,
                                    name: item.product.name,
                                    quantity: item.quantity,
                                    price: item.product.price
                                })),
                                totalAmount: order.amount / 100, // Convert from smallest currency unit
                                currency: order.currency,
                                status: 'paid',
                                orderDate: new Date().toISOString(),
                                paymentMethod: 'online',
                                shippingAddress: addresses[selectedAddressIndex]
                            };

                            const orderResponse = await fetch('/api/create-order', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(orderData),
                            });

                            if (!orderResponse.ok) {
                                const errorText = await orderResponse.text();
                                console.error('Server response:', errorText);
                                throw new Error(`Failed to create order in Sanity: ${errorText}`);
                            }

                            window.location.href = `/success?session_id=${razorpayResponse.razorpay_payment_id}&orderNumber=${order.orderNumber}`;
                        } catch (error: unknown) {
                            if (error instanceof Error) {
                                console.error("Error creating order in Sanity:", error.message);
                            } else {
                                console.error("Error creating order in Sanity:", error);
                            }
                            alert("Failed to create order. Please contact support.");
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setIsLoading(false);
                        }
                    },
                    theme: {
                        color: "#3B82F6"
                    }
                };

                const razorpay = new ((window as unknown as RazorpayWindow).Razorpay)(options);
                razorpay.open();
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("Failed to initiate checkout. Please try again.");
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Checkout Error"
                message={modalMessage}
            />
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
                                    <label 
                                        key={index} 
                                        className={`flex items-center justify-between p-4 border rounded cursor-pointer ${
                                            selectedAddressIndex === index ? 'border-blue-500 bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-center flex-1">
                                            <input
                                                type="radio"
                                                name="deliveryAddress"
                                                checked={selectedAddressIndex === index}
                                                onChange={() => setSelectedAddressIndex(index)}
                                                className="mr-3 h-4 w-4 text-blue-500"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{`${address.firstName} ${address.lastName}`}</p>
                                                <p className="text-sm text-gray-600">{address.address1}</p>
                                                {address.address2 && (
                                                    <p className="text-sm text-gray-600">{address.address2}</p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    {`${address.landmark ? address.landmark + ', ' : ''}${address.pincode}`}
                                                </p>
                                                <p className="text-sm text-gray-600">{address.mobile}</p>
                                            </div>
                                        </div>
                                        <button 
                                            className="text-red-500 ml-4 hover:text-red-700"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeAddress(index);
                                                if (selectedAddressIndex === index) {
                                                    setSelectedAddressIndex(0);
                                                }
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </label>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 border rounded">
                                    <p className="text-gray-500 mb-4">No addresses available.</p>
                                    <button 
                                        onClick={() => setShowPopup(true)} 
                                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                                    >
                                        Add New Address
                                    </button>
                                </div>
                            )}
                            
                            {addresses.length > 0 && (
                                <button 
                                    onClick={() => setShowPopup(true)} 
                                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add Another Address
                                </button>
                            )}
                            
                            {showPopup && (
                                <AddAddressPopup 
                                    onClose={() => {
                                        setShowPopup(false);
                                        if (addresses.length === 0) {
                                            setSelectedAddressIndex(0);
                                        }
                                    }} 
                                />
                            )}
                        </div>
                    </div>
                    <div className="w-full h-fit bg-white p-4 pl-2 rounded">
                        <h2 className="text-xl font-semibold">Select Payment Mode</h2>
                        <div className="mt-4 space-y-2">
                            <label className="flex items-center justify-between p-4 border rounded cursor-pointer w-full
                                ${selectedPaymentMode === 'online' ? 'border-blue-500 bg-blue-50' : ''}">
                                <div className="flex items-center flex-1">
                                    <input
                                        type="radio"
                                        name="paymentMode"
                                        value="online"
                                        checked={selectedPaymentMode === 'online'}
                                        onChange={() => setSelectedPaymentMode('online')}
                                        className="mr-3 h-4 w-4 text-blue-500"
                                    />
                                    <span>Pay Online</span>
                                </div>
                            </label>
                            
                            <label className="flex items-center justify-between p-4 border rounded cursor-pointer w-full
                                ${selectedPaymentMode === 'cod' ? 'border-blue-500 bg-blue-50' : ''}">
                                <div className="flex items-center flex-1">
                                    <input
                                        type="radio"
                                        name="paymentMode"
                                        value="cod"
                                        checked={selectedPaymentMode === 'cod'}
                                        onChange={() => setSelectedPaymentMode('cod')}
                                        className="mr-3 h-4 w-4 text-blue-500"
                                    />
                                    <span>Cash On Delivery</span>
                                </div>
                            </label>
                        </div>
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

export default CartPage;