import { Product, Category } from "@/sanity.types";
import ProductGrid from "./ProductGrid";
import { CategorySelectorComponent } from "./ui/category-selector";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

function ProductsView({ products, categories }: ProductsViewProps) {
  return (
    <div className="flex flex-col max-w-[1080px] px-4 lg:px-0 pb-16">
      <div className="flex justify-end mt-4">
        <div className="w-full sm:w-[200px]">
            <CategorySelectorComponent categories={categories} />
        </div>
      </div>

        <div className="flex-1">
            <div>
                <ProductGrid products={products} />
            </div>
        </div>
    </div>
  )
}

export default ProductsView