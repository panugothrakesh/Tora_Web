import { TagIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const salesType = defineType({
    name: 'sale',
    title: 'Sale',
    type: 'document',
    icon: TagIcon,
    fields: [
        defineField({
            name: 'title',
            type: 'string',
            title: 'Sale Title',
        }),
        defineField({
            name: 'description',
            type: 'text',
            title: 'Sale Description',
        }),
        defineField({
            name: 'discountAmount',
            type: 'number',
            title: 'Discount Amount',
            description: 'Amount off in discount or Fixed amount off',
        }),
        defineField({
            name: 'couponCode',
            type: 'string',
            title: 'Coupon Code',
        }),
        defineField({
            name: 'validFrom',
            type: 'date',
            title: 'Valid From',
        }),
        defineField({
            name: 'validTo',
            type: 'date',
            title: 'Valid To',
        }),
        defineField({
            name: 'isActive',
            type: 'boolean',
            title: 'Is Active',
            description: 'Toggle to activate or deactivate the sale',
            initialValue: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            discountAmount: 'discountAmount',
            couponCode: 'couponCode',
            isActive: 'isActive',
        },
        prepare(selection) {
            const {title, discountAmount, couponCode, isActive} = selection
            const status = isActive ? 'Active' : 'Inactive'
            return {
                title,
                subtitle: `${discountAmount}% off ${couponCode} - ${status}`,
            }
        },
    },
})
