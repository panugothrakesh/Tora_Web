'use client'
import { Product } from '@/sanity.types'

import { Button } from './ui/button'
import { useBasketStore } from '@/store/store'
import { useEffect } from 'react'
import { useState } from 'react'
import { SignInButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AddToBasketButtonProps {
    product: Product
    disabled?: boolean
}

function AddToBasketButton({ product, disabled }: AddToBasketButtonProps) {
    const { addItem, removeItem, getItemCount } = useBasketStore()
    const itemCount = getItemCount(product._id)

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null
    return (
        <div className="flex items-center justify-center space-x-2">
            <Button onClick={() => removeItem(product._id)} disabled={itemCount === 0 || disabled} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}>
                <span className={`text-xl font-bold ${itemCount === 0 ? "text-gray-400" : "text-gray-600"}`}>
                    -
                </span>
            </Button>
            <span className="w-8 text-center font-semibold">{itemCount}</span>
            <Button onClick={() => addItem(product)} disabled={disabled} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100" : "bg-gray-200 hover:bg-gray-300"}`}>
                <span className={`text-xl font-bold`}>
                    +
                </span>
            </Button>
        </div>
    )
}

export const AddToCart = ({ product, disabled }: AddToBasketButtonProps) => {
    const { addItem, removeItem, getItemCount } = useBasketStore()
    const itemCount = getItemCount(product._id)
    const [showSignIn, setShowSignIn] = useState(false);
    const { isSignedIn } = useUser()
    const router = useRouter()

    const buyNow = () => {
        try {
            addItem(product);
            if (isSignedIn) {
                router.push('/cart');
            } else {
                setShowSignIn(true);
            }
        } catch (error) {
            console.error("Error adding item:", error);
        }
    }

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null
    if (showSignIn) {
        return (
            <div className='w-screen absolute top-0 left-0 z-[2000] h-screen bg-black bg-opacity-50 flex items-center justify-center'>
                <div className="sm:max-w-[600px] bg-white px-12 py-10 rounded-lg flex flex-col items-center justify-center gap-4">
                    <div className='flex flex-col justify-center items-center gap-2'>
                        <h2 className='text-2xl font-semibold'>Login to got to Cart</h2>
                        <p className='text-sm font-medium'>
                            Please login to proceed to card or add to cart to checkout at the cart!
                        </p>
                    </div>
                    <SignInButton mode='modal'>
                        <button className='flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-primaryText bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 ease-in-out text-white px-4 py-2 rounded-md font-semibold'>
                            <span className='text-sm'>Sign In</span>
                        </button>
                    </SignInButton>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center space-x-2">
            {itemCount === 0 ?
                <>
                    <Button onClick={() => addItem(product)} disabled={disabled} className={` w-full py-5 rounded-md flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100" : "bg-gray-200 hover:bg-gray-300"}`}>
                        <span className={`text-lg font-semibold`}>
                            Add to Cart
                        </span>
                    </Button>
                    <Button onClick={() => buyNow()} className={` w-full py-5 rounded-md bg-black/90 hover:bg-black text-white flex items-center justify-center transition-colors duration-200`}>
                        <span className={`text-lg font-semibold`}>
                            Buy Now
                        </span>
                    </Button>
                </>
                :
                <div className='flex md:flex-row flex-col justify-center items-center w-full md:gap-8 gap-2'>
                    <div className='flex items-center justify-center gap-2'>
                    <Button onClick={() => removeItem(product._id)} disabled={itemCount === 0 || disabled} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}>
                        <span className={`text-xl font-bold ${itemCount === 0 ? "text-gray-400" : "text-gray-600"}`}>
                            -
                        </span>
                    </Button>
                    <span className="w-8 text-center font-semibold">{itemCount}</span>
                    <Button onClick={() => addItem(product)} disabled={disabled} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100" : "bg-gray-200 hover:bg-gray-300"}`}>
                        <span className={`text-xl font-bold`}>
                            +
                        </span>
                    </Button>
                    </div>
                    <Button className={`sm:w-1/2 w-full rounded-md flex items-center justify-center transition-colors duration-200`}>
                        <Link href={"/cart"} className={`w-full flex items-center justify-center`}>
                            <span className={`text-lg font-semibold`}>
                                Continue to Cart
                            </span>
                        </Link>
                    </Button>
                </div>
            }
        </div>
    )
}

export default AddToBasketButton