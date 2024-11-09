import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { notFound } from "next/navigation";
import ProductDisplay from "@/components/ProductDisplay";

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const product = await getProductBySlug(params.slug);
    if (!product) return notFound();

    return <ProductDisplay product={product} />;
}