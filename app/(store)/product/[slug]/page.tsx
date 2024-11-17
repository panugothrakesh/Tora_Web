import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { notFound } from "next/navigation";
import ProductDisplay from "@/components/ProductDisplay";

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product || Array.isArray(product)) return notFound();

    return <ProductDisplay product={product} />;
}