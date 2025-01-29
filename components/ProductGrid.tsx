'use client'

import { Product } from "@/sanity.types";
import ProductCard from "./ProductCard";
import { AnimatePresence, motion } from "framer-motion";

interface ProductGridProps {        
    products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {products.map((product) => {
        return( 
          <AnimatePresence key={product._id}>
            <motion.div
              layout
              initial={{ opacity: 0}}
              animate={{ opacity: 1}}
              exit={{ opacity: 0}}
              className="flex justify-center"
            >
              <ProductCard key={product._id} product={product} />
            </motion.div>
          </AnimatePresence>
        )
      })}
    </div>
  )
}

export default ProductGrid