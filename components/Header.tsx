"use client";
import { ClerkLoaded, SignedIn, SignIn, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import Form from 'next/form';
import React from 'react'
import { PackageCheckIcon, ShoppingCartIcon } from 'lucide-react';

function Header() {
    const { user } = useUser();
    return (
        <header className='flex text-primaryText flex-wrap justify-between items-center p-4 py-2'>
            {/* Top Row */}
            <div className='flex w-full flex-wrap justify-between items-center'>
                <Link href="/" className='flex items-center gap-2 text-xl font-serif font-semibold hover:opacity-80 transition-all duration-300 ease-out cursor-pointer mx-auto sm:mx-0'>
                    <Image className='w-8 h-8' src={'./assets/TORAIcon.svg'} alt='TORA Icon' width={100} height={100} />
                    TORA
                </Link>

                <Form action="/search" className='w-full sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0'>
                    <input className='bg-gray-100 text-gray-800 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryText focus:ring-opacity-80 border w-full max-w-4xl' type="text" name="query" id="search for products" placeholder='Search' />
                </Form>

                <div className='flex items-center space-x-4 mt-4 sm:mt-0 flex-1 sm:flex-none'>
                    <Link href="/cart" className='flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 border border-primaryText hover:bg-primaryText transition-all duration-300 ease-in-out hover:text-white text-primaryText px-4 py-2 rounded-md font-semibold'>
                        <ShoppingCartIcon className='w-5 h-5' />
                        {/* Cart Count */}
                        <span className='text-sm'>My Cart</span>
                    </Link>


                    <div className='flex items-center gap-2'>
                        <ClerkLoaded>
                            <SignedIn>
                                <Link href="/orders" className='flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 border border-primaryText hover:bg-primaryText transition-all duration-300 ease-in-out hover:text-white text-primaryText px-4 py-2 rounded-md font-semibold'>
                                    <PackageCheckIcon className='w-5 h-5' />
                                    <span className='text-sm'>My Orders</span>
                                </Link>
                            </SignedIn>

                            {user ? (
                                <div className="flex items-center space-x-2">
                                    <UserButton />
                                    <div className="hidden sm:block text-xs"> <p className=" • text-gray-400">Welcome Back</p>
                                        <p className="font-bold">{user.fullName}!</p>
                                    </div>
                                </div>
                            ) : (
                                <SignInButton mode='modal'>
                                    <button className='flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-primaryText bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 ease-in-out text-white px-4 py-2 rounded-md font-semibold'>
                                        <span className='text-sm'>Sign In</span>
                                    </button>
                                </SignInButton>
                            )}
                        </ClerkLoaded>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header