'use client'
import { Product } from '@/sanity.types'
import { Button } from './ui/button'
import {useBasketStore} from '@/store/store'
import { useEffect } from 'react'
import { useState } from 'react'

interface AddToBasketButtonProps {
    product: Product
    disabled: boolean
}

function AddToBasketButton({ product, disabled }: AddToBasketButtonProps) {
    const { addItem, removeItem, getItemCount } = useBasketStore()
    const itemCount = getItemCount(product._id)

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if(!isClient) return null
  return (
    <div className="flex items-center justify-center space-x-2">
        <Button onClick={() => removeItem(product._id)} disabled={itemCount === 0 || disabled} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}>
            <span className={`text-xl font-bold ${itemCount === 0 ? "text-gray-400" : "text-gray-600"}`}>
                -
            </span>
        </Button>
        <span className="w-8 text-center font-semibold">{itemCount}</span>
        <Button onClick={() => addItem(product)} disabled={disabled} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${itemCount === 0 ? " bg-gray-100 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}>
            <span className={`text-xl font-bold`}>
                +
            </span>
        </Button>
    </div>
  )
}

export default AddToBasketButton