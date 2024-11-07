import { Product, Category } from "@/sanity.types";
import ProductGrid from "./ProductGrid";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

function ProductsView({ products, categories }: ProductsViewProps) {
  return (
    <div>
        <div>
            {/* <CategorySelectorComponent categories={categories} /> */}
        </div>

        <div className="flex-1">
                <div>
                    <ProductGrid products={products} />
                <hr className="w-1/2 sm:w-3/4"/>
            </div>
        </div>
        
    </div>
  )
}

export default ProductsView