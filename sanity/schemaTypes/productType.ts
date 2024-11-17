import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
    name: 'product',
    title: 'Products',
    type: 'document',
    icon: TrolleyIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Product Name',
            type: 'string',
            validation: (Rule) => Rule.required().error('Product name is required'),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required().error('Slug is required'),
        }),
        defineField({
            name: 'images',
            title: 'Product Images',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
            validation: (Rule) => Rule.required().min(1).error('At least one image is required'),
        }),
        defineField({
            name: 'description',
            title: 'Product Description',
            type: 'blockContent',
            validation: (Rule) => Rule.required().error('Product description is required'),
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().min(0).error('Product price is required'),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'category' }] }],
            validation: (Rule) => Rule.required().min(1).error('At least one category is required'),
        }),
        defineField({
            name: 'stock',
            title: 'Stock',
            type: 'number',
            validation: (Rule) => Rule.required().min(0).error('Stock must be greater than or equal to 0'),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'images',
            price: 'price',
        },
        prepare(select) {
            return {
                title: select.title,
                subtitle: `₹${select.price}`,
                media: select.media[0],
            };
        },
    },
});