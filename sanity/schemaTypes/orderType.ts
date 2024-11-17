import { defineArrayMember, defineType } from "sanity";

import { BasketIcon } from "@sanity/icons";
import { defineField } from "sanity";

export const orderType = defineType({
    name: 'order',
    title: 'Order',
    type: 'document',
    icon: BasketIcon,
    fields: [
        defineField({
            name: 'orderNumber',
            title: 'Order Number',
            type: 'string',
            validation: (Rule) => Rule.required().error('Order number is required'),
        }),
        defineField({
            name: 'RazorpayCheckoutId',
            title: 'Razorpay Checkout ID',
            type: 'string',
        }),
        defineField({
            name: 'RazorpayCustomerId',
            title: 'Razorpay Customer ID',
            type: 'string',
            validation: (Rule) => Rule.required().error('Razorpay Customer ID is required'),
        }),
        defineField({
            name: 'clerkUserId',
            title: 'Clerk User ID',
            type: 'string',
            validation: (Rule) => Rule.required().error('Clerk User ID is required'),
        }),
        defineField({
            name: 'name',
            title: 'Customer Name',
            type: 'string',
            validation: (Rule) => Rule.required().error('Customer Name is required'),
        }),
        defineField({
            name: 'email',
            title: 'Customer Email',
            type: 'string',
            validation: (Rule) => Rule.required().error('Customer Email is required'),
        }),
        defineField({
            name: 'RazorpayPaymentIntentId',
            title: 'Razorpay Payment Intent ID',
            type: 'string',
            validation: (Rule) => Rule.required().error('Razorpay Payment Intent ID is required'),
        }),
        defineField({
            name: 'products',
            title: 'Products',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'product',
                            title: 'Product Bought',
                            type: 'reference',
                            to: [{ type: 'product' }],
                        }),
                        defineField({
                            name: 'quantity',
                            title: 'Quantity Purchased',
                            type: 'number',
                        }),
                    ],
                    preview: {
                        select: {
                            product: 'product.name',
                            quantity: 'quantity',
                            images: 'product.images',
                            price: 'product.price',
                            currency: 'product.currency',
                        },
                        prepare(select) {
                            return {
                                title: `${select.product} x ${select.quantity}`,
                                subtitle: `₹${select.price *  select.quantity}`,
                                media: select.images[0],
                            }
                        },
                    },
                }),
            ],
        }),
        defineField({
            name: 'totalAmount',
            title: 'Total Amount',
            type: 'number',
            validation: (Rule) => Rule.required().error('Total Amount is required'),
        }),
        defineField({
            name: 'currency',
            title: 'Currency',
            type: 'string',
            validation: (Rule) => Rule.required().error('Currency is required'),
        }),
        defineField({
            name: 'amountDiscount',
            title: 'Amount Discounted',
            type: 'number',
            validation: (Rule) => Rule.min(0).error('Amount Discounted cannot be negative'),
        }),
        defineField({
            name: 'status',
            title: 'Order Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Paid', value: 'paid' },
                    { title: 'Shipped', value: 'shipped' },
                    { title: 'Delivered', value: 'delivered' },
                    { title: 'Cancelled', value: 'cancelled' },
                    { title: 'Returned', value: 'returned' },
                    { title: 'Refunded', value: 'refunded' },
                ],
            },
        }),
        defineField({
            name: 'orderDate',
            title: 'Order Date',
            type: 'datetime',
            validation: (Rule) => Rule.required().error('Order Date is required'),
        }),
    ],
    preview: {
        select: {
            name: 'name',
            amount: 'totalAmount',
            currency: 'currency',
            orderId: 'orderNumber',
            email: 'email',
        },
        prepare(select) {
            const orderIdSnippet = `${select.orderId.slice(0, 6)}...${select.orderId.slice(-5)}`;
            return {
                title: `${select.name} (${orderIdSnippet})`,
                subtitle: `₹${select.amount}, ${select.email}`,
                media: BasketIcon,
            };
        },
    },
})