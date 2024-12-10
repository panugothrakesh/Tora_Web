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
            initialValue: '',
        }),
        defineField({
            name: 'RazorpayCustomerId',
            title: 'Razorpay Customer ID',
            type: 'string',
            initialValue: '',
        }),
        defineField({
            name: 'RazorpayPaymentIntentId',
            title: 'Razorpay Payment Intent ID',
            type: 'string',
            initialValue: '',
        }),
        defineField({
            name: 'paymentMethod',
            title: 'Payment Method',
            type: 'string',
            options: {
                list: [
                    { title: 'Cash on Delivery', value: 'cod' },
                    { title: 'Online Payment', value: 'online' },
                ],
            },
            validation: (Rule) => Rule.required(),
            initialValue: 'online'
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
        defineField({
            name: 'shippingAddress',
            title: 'Shipping Address',
            type: 'object',
            validation: (Rule) => Rule.required(),
            fields: [
                {
                    name: 'firstName',
                    type: 'string',
                    title: 'First Name',
                    validation: (Rule) => Rule.required()
                },
                {
                    name: 'lastName',
                    type: 'string',
                    title: 'Last Name',
                    validation: (Rule) => Rule.required()
                },
                {
                    name: 'mobile',
                    type: 'string',
                    title: 'Mobile',
                    validation: (Rule) => Rule.required()
                },
                {
                    name: 'address1',
                    type: 'string',
                    title: 'Address Line 1',
                    validation: (Rule) => Rule.required()
                },
                {
                    name: 'address2',
                    type: 'string',
                    title: 'Address Line 2'
                },
                {
                    name: 'landmark',
                    type: 'string',
                    title: 'Landmark'
                },
                {
                    name: 'pincode',
                    type: 'string',
                    title: 'Pincode',
                    validation: (Rule) => Rule.required()
                }
            ]
        })
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