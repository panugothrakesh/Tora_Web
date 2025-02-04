"use client";
import { imageUrl } from "@/lib/imageUrl";
import { PortableText } from "next-sanity";
import Image from "next/image";
import { Product } from "@/sanity.types";
import { useState } from "react";
import { AddToCart } from "./AddToBasketButton";
import ProductGrid from "./ProductGrid";
import Link from "next/link";

interface ProductDisplayProps {
  product: Product;
  products: Product[];
}

export default function ProductDisplay({
  product,
  products,
}: ProductDisplayProps) {
  const isOutOfStock = product.stock != null && product.stock <= 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product.images?.length ?? 0) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (product.images?.length ?? 0) - 1 ? 0 : prev + 1
    );
  };

  const currentIndex = products.findIndex((p) => p._id === product._id);

  const randomProducts = Array.from({ length: 4 }, (_, i) => {
    return products[(currentIndex + i + 1) % products.length];
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className={`relative aspect-square overflow-hidden rounded-lg shadow-lg ${isOutOfStock ? "opacity-50" : ""}`}
        >
          {product.images && product.images.length > 0 && (
            <>
              <Image
                src={imageUrl(product.images[currentImageIndex]).url()}
                alt={product.name ?? "Product image"}
                fill
                className="object-contain transition-transform duration-300 hover:scale-105"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    aria-label="Next image"
                  >
                    →
                  </button>
                </>
              )}
            </>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black opacity-50">
              <span className="text-white text-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {product.price && (
              <div className="text-2xl font-semibold mb-4 text-black/80 flex items-center space-x-4">
                <span className="text-3xl opacity-60 text-gray-800 relative before:absolute before:w-full before:p-[1px] before:-rotate-[15deg] before:translate-y-[700%] before:bg-gray-800">
                  ₹{(product.price + 1) * 1.25 - 1}
                </span>
                <span>₹ {product.price?.toFixed(2)}</span>
              </div>
            )}
            <div className="prose max-w-none mb-6">
              {Array.isArray(product.description) && (
                <PortableText value={product.description} />
              )}
            </div>
          </div>
          <div className="mt-4">
            <AddToCart product={product} disabled={isOutOfStock} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"></div>
      <div className="py-20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-4">More Products</h1>
          <Link
            href={"/"}
            className="prose max-w-none mb-6 cursor-pointer hover:underline py-2"
          >
            Explore more &gt;
          </Link>
        </div>
        {randomProducts && <ProductGrid products={randomProducts} />}
      </div>
    </div>
  );
}
