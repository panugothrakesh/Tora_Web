import { Product, Category } from "@/sanity.types";
import ProductGrid from "./ProductGrid";
import { CategorySelectorComponent } from "./ui/category-selector";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

function ProductsView({ products, categories }: ProductsViewProps) {
  return (
    <div className="flex flex-col max-w-[1080px] lg:px-0 pb-16">
      <div className="flex flex-col sm:flex-row space-y-2 justify-between items-center mt-4">
        <span className="text-xl font-bold">Our Products</span>
        <div className="w-full sm:w-[200px]">
          <CategorySelectorComponent categories={categories} />
        </div>
      </div>

      <div className="flex-1">
        <div className="w-screen md:w-full overflow-x-hidden">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}

export default ProductsView;
