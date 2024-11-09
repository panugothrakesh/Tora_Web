import { searchProductsByName } from "@/sanity/lib/products/searchProductsByName";
import ProductGrid from "@/components/ProductGrid";
interface SearchPageProps {
  searchParams: {
    query: string
  }
}

async function Page({ searchParams }: SearchPageProps) {
  const { query } = await searchParams;
  const products = await searchProductsByName(query)

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4"> <div className=" bg-white p-8 rounded-lg shadow-d w-full max-w~4x1">
        <h1 className="text-3xl font-bold mb-6 text-center"> No products found for: {query}
        </h1>
        <p className=" •text-gray-600 text-center">
          Try searching with different keywords
        </p>
      </div>
      </div>)
  }

  return (
    <div className="flex flex-col items-center justify-top min-h-screen bg-gray-100 p-4">
      <div className=" bg-white p-8 rounded-lg shadow-d w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Search results for {query}
          <ProductGrid products={products} />
        </h1>
      </div>
    </div>
    )
}

export default Page