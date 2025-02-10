import BlackFridayBanner from "@/components/BlackFridayBanner";
import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";
import Image from "next/image";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  console.log(
    crypto.randomUUID().slice(0, 5) +
      ">>> Rerendered the home page cache with ${products. length} products and ${categories length} categories"
  );
  return (
    <div>
      <BlackFridayBanner />
      <div className="bg-black flex items-center justify-center py-16">
        <Image
          className="h-48 w-48"
          src={"/tora.jpeg"}
          alt="ToraBanner"
          width={100}
          height={100}
        />
      </div>
      <div className="flex flex-col items-center justify-top bg-gray-100">
        <ProductsView products={products} categories={categories} />
      </div>
    </div>
  );
}
