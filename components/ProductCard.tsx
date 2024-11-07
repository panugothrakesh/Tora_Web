import { Product } from "@/sanity.types";
import Link from "next/link";

interface ProductCardProps {        
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;
  return (
    <Link href={`/products/${product.slug?.current}`} className={`group flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
        Product
    </Link>
  )
}

export default ProductCard