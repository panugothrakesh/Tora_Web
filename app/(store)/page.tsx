import ProductsView from "@/components/ProductsView";
import { getAllCategories } from "@/sanity/lib/products/getAllCategories";
import { getAllProducts } from "@/sanity/lib/products/getAllProducts";

export default async function Home() {
  const products = await getAllProducts();
  const categories = await getAllCategories();
  return (
    <div>
      <h1>Tora 123</h1>
      <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100">
        <ProductsView products={products} categories={categories} />
      </div>
    </div>
  );
}
