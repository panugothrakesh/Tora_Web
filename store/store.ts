import { Product } from "@/sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BasketItem {
    product: Product;
    quantity: number;
    size: string;
}

export interface Address {
    firstName: string;
    lastName: string;
    mobile: string;
    address1: string;
    address2?: string;
    landmark?: string;
    pincode: string;
}

interface BasketState {
    items: BasketItem[];
    addresses: Address[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    clearBasket: () => void;
    getTotalPrice: () => number;
    getItemCount: (productId: string) => number;
    getGroupedItems: () => BasketItem[];
    getAddresses: () => Address[];
    addAddress: (address: Address) => void;
    removeAddress: (addressIndex: number) => void;
    updateItemSize: (productId: string, size: string) => void;
}

export const useBasketStore = create<BasketState>()(persist((set, get) => ({
    items: [],
    addresses: [],
    addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item.product._id === product._id);
        if (existingItem) {
            return {
                items: state.items.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            };
        } else {
            return { items: [...state.items, { product, quantity: 1, size: 'M' }] };
        }
    }),
    removeItem: (productId) => set((state) => ({
        items: state.items.reduce((acc, item) => {
            if (item.product._id === productId) {
                if (item.quantity > 1) {
                    acc.push({ ...item, quantity: item.quantity - 1 });
                }
            } else {
                acc.push(item);
            }
            return acc;
        }, [] as BasketItem[])
    })),
    clearBasket: () => set({ items: [] }),
    getTotalPrice: () => get().items.reduce((total, item) => total + (item.product.price ?? 0) * item.quantity, 0),
    getItemCount: (productId) => {
        const item = get().items.find(item => item.product._id === productId);
        return item ? item.quantity : 0;
    },
    getGroupedItems: () => get().items,
    getAddresses: () => get().addresses,
    addAddress: (address) => set((state) => {
        const currentAddresses = Array.isArray(state.addresses) ? state.addresses : [];
        return {
            addresses: [...currentAddresses, address]
        };
    }),
    removeAddress: (addressIndex) => set((state) => {
        const updatedAddresses = state.addresses.filter((_, index) => index !== addressIndex);
        return { addresses: updatedAddresses };
    }),
    updateItemSize: (productId: string, size: string) => 
        set((state) => ({
            items: state.items.map(item => 
                item.product._id === productId 
                    ? { ...item, size } 
                    : item
            )
        })),
}), { name: "basket-store" }));
console.log(' :', );