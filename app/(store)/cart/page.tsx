"use client";
import {
  createCheckoutSession,
  Metadata,
} from "@/actions/createCheckoutSession";
import AddAddressPopup from "@/components/AddAddressPopup";
import AddToBasketButton from "@/components/AddToBasketButton";
import Loader from "@/components/ui/Loader";
import { imageUrl } from "@/lib/imageUrl";
import { useBasketStore } from "@/store/store";
import { useUser, SignInButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";

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
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<
    "online" | "cod"
  >("cod");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [addressToRemove, setAddressToRemove] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  console.log(user);
  if (!isClient || !groupedItems) return <Loader />;

  if (groupedItems.length == 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Basket</h1>
        <p className=" @text-gray-600 text-lg">Your basket is empty.</p>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) return;

    if (addresses.length === 0) {
      setModalMessage("Please add an address before proceeding to checkout.");
      setModalOpen(true);
      return;
    }

    if (!selectedPaymentMode) {
      setModalMessage(
        "Please select a payment mode before proceeding to checkout."
      );
      setModalOpen(true);
      return;
    }

    setIsLoading(true);
    const orderNumber = crypto.randomUUID();

    try {
      if (selectedPaymentMode === "cod") {
        const response = await fetch("/api/create-cod-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNumber,
            clerkUserId: user.id,
            customerName: user.fullName,
            customerEmail: user.emailAddresses[0].emailAddress,
            products: groupedItems,
            totalAmount: useBasketStore.getState().getTotalPrice(),
            selectedAddress: addresses[selectedAddressIndex],
            paymentMethod: selectedPaymentMode,
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
          paymentMethod: "online",
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
                products: groupedItems.map((item) => ({
                  id: item.product._id,
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.product.price,
                  size: item.size || 'M',
                })),
                totalAmount: order.amount / 100, // Convert from smallest currency unit
                currency: order.currency,
                status: "paid",
                orderDate: new Date().toISOString(),
                paymentMethod: "online",
                shippingAddress: addresses[selectedAddressIndex],
              };

              const orderResponse = await fetch("/api/create-order", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
              });

              if (!orderResponse.ok) {
                const errorText = await orderResponse.text();
                console.error("Server response:", errorText);
                throw new Error(
                  `Failed to create order in Sanity: ${errorText}`
                );
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
            },
          },
          theme: {
            color: "#3B82F6",
          },
        };

        const razorpay = new (window as unknown as RazorpayWindow).Razorpay(
          options
        );
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

  const handleRemoveClick = (index: number) => {
    setAddressToRemove(index);
    setShowConfirmModal(true);
  };

  const confirmRemoveAddress = () => {
    if (addressToRemove !== null) {
      removeAddress(addressToRemove);
      if (selectedAddressIndex === addressToRemove) {
        setSelectedAddressIndex(0);
      }
      setAddressToRemove(null);
    }
    setShowConfirmModal(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Checkout Error"
        message={modalMessage}
      />
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Removal"
        message="Are you sure you want to remove this address?"
      >
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="bg-red-500 hover:bg text-white"
            onClick={confirmRemoveAddress}
          >
            Confirm
          </Button>
        </div>
      </Modal>
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="flex-grow">
          <div className="lg:h-[80vh] lg:overflow-y-auto ">
            {groupedItems?.map((item) => (
              <div
                key={item.product._id}
                className="mb-4 p-4 border rounded flex items-center justify-between"
              >
                <div
                  className="flex items-center cursor-pointer flex-1 min-w-0"
                  onClick={() =>
                    router.push(`/product/${item.product.slug?.current}`)
                  }
                >
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
                <div className="flex items-center ml-4 flex-shrink-0 gap-4">
                  <select 
                    value={item.size || 'M'} 
                    onChange={(e) => {
                      const newSize = e.target.value;
                      useBasketStore.getState().updateItemSize(item.product._id, newSize);
                    }}
                    className="h-10 rounded-md border border-gray-200 px-3 text-black"
                  >
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <AddToBasketButton product={item.product} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-start h-fit border rounded-md gap-0">
          <div className="w-full bg-white p-4 rounded-md">
            <h2 className="text-md font-semibold">Select Address to Deliver</h2>
            <div className="mt-4">
              {addresses.length > 0 ? (
                addresses.map((address, index) => (
                  <label
                    key={index}
                    className={`flex flex-col md:flex-row gap-4 md:gap-0 mb-2 items-end md:items-center justify-between p-2 px-4 border rounded cursor-pointer ${
                      selectedAddressIndex === index
                        ? "border-black bg-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <input
                        type="radio"
                        name="deliveryAddress"
                        checked={selectedAddressIndex === index}
                        onChange={() => setSelectedAddressIndex(index)}
                        className="mr-3 h-4 w-4 accent-black"
                      />
                      <div className="flex-1 flex flex-col gap-1">
                        <p className="font-semibold">{`${address.firstName} ${address.lastName}`}</p>
                        <p className="text-sm text-gray-600 w-[90%]">
                          <span className="font-medium">Address:</span>{" "}
                          {address.address1},{" "}
                          {address.address2 && address.address2}.
                        </p>
                        <p className="text-sm text-gray-600 w-[90%]">
                          <span className="font-medium">Landmark:</span>{" "}
                          {`${address.landmark ? address.landmark + ", " : ""}${address.pincode}`}
                        </p>
                        <p className="text-sm text-gray-600 w-[90%]">
                          <span className="font-medium">Mobile:</span> +91{" "}
                          {address.mobile.split("").slice(0, 5).join("")}{" "}
                          {address.mobile.split("").slice(5, 10).join("")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-red-500 hover:bg text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveClick(index);
                      }}
                    >
                      Remove
                    </Button>
                  </label>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border rounded">
                  <p className="text-gray-500">No addresses available.</p>
                  <button
                    onClick={() => setShowPopup(true)}
                    className="bg-black/90 text-white px-6 py-2 rounded hover:bg-black"
                  >
                    Add New Address
                  </button>
                </div>
              )}

              {addresses.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowPopup(true)}
                  className="mt-2 w-full border-black/30 border bg-gray-50 text-black font-semibold px-4 py-2 rounded hover:bg-gray-100"
                >
                  Add Another Address
                </Button>
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
          <hr className="border-black/10 border-1" />
          <div className="w-full bg-white p-4 rounded-md">
            <h2 className="text-md font-semibold">Select Payment Mode</h2>
            <div className="mt-4 space-y-2">
              <label
                className="flex items-center justify-between p-4 border rounded cursor-pointer w-full
                                ${selectedPaymentMode === 'online' ? 'border-black bg-gray-100' : ''}"
              >
                <div className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="online"
                    checked={selectedPaymentMode === "online"}
                    onChange={() => setSelectedPaymentMode("online")}
                    className="mr-3 h-4 w-4 accent-black"
                  />
                  <span>Pay Online</span>
                </div>
              </label>

              <label
                className="flex items-center justify-between p-4 border rounded cursor-pointer w-full
                                ${selectedPaymentMode === 'cod' ? 'border-black bg-gray-100' : ''}"
              >
                <div className="flex items-center flex-1">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="cod"
                    checked={selectedPaymentMode === "cod"}
                    onChange={() => setSelectedPaymentMode("cod")}
                    className="mr-3 h-4 w-4 accent-black"
                  />
                  <span>Cash On Delivery</span>
                </div>
              </label>
            </div>
          </div>
          <hr className="border-black/10 border-1" />
          <div className="w-full bg-white p-4 rounded-md">
            <h2 className="text-md font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-2">
              <p className="flex justify-between">
                <span>Items:</span>
                <span>
                  {groupedItems.reduce(
                    (total, item) => total + item.quantity,
                    0
                  )}
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
                className="mt-4 w-full bg-black/90 text-white px-4 py-2 rounded hover:bg-black disabled:bg-gray-400"
              >
                {isLoading ? "Processing..." : "Checkout"}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="mt-4 w-full bg-black/90 text-white px-4 py-2 rounded hover:bg-black disabled:bg-gray-400">
                  Sign in to Checkout
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
