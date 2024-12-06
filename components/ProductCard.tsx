import { imageUrl } from "@/lib/imageUrl";
import { Product } from "@/sanity.types";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {        
    product: Product;
}

function ProductCard({ product }: ProductCardProps) {
    const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;
  return (
    <Link href={`/product/${product.slug?.current}`} className={`group flex flex-col w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="relative aspect-square w-full h-full overflow-hidden">
            {product.images && (
                <Image
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    src={imageUrl(product.images[0]).url()}
                    alt={product.name || 'Product Image'}
                    fill
                />
            )}
            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black opacity-50">
                    <span className="text-white text-md font-semibold">Out of Stock</span>
                </div>
            )}
        </div>

        <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 truncate">
                {product.name   }
            </h2>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.description?.map((block) => (
                    block._type === 'block' ? 
                    block.children?.map((child) => child.text).join('') : ''
                ))}
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-800">
                ₹{product.price}
            </p>
        </div>
    </Link>
  )
}

export default ProductCard