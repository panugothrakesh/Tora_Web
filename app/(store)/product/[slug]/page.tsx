import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { notFound } from "next/navigation";
import ProductDisplay from "@/components/ProductDisplay";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export const dynamic = "force-static"
export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    console.log(
        crypto. randomUUID(). slice(0, 5) +
        '>>> Rerendered the home page cache with ${products. length} products and ${categories length} categories'
      )
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    const products = await getAllProducts();
    if (!product || Array.isArray(product)) return notFound();

    return <ProductDisplay product={product} products={products} />;
}