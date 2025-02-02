"use client";
import Link from "next/link";
import React from "react";

function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        {/* Logo Section */}
        <Link
          href="/"
          className="text-xl pl-4 font-serif font-semibold hover:opacity-80 transition-all duration-300 ease-out cursor-pointer mb-4 sm:mb-0"
        >
          TORA
        </Link>

        {/* Links Section */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 sm:mt-0">
          <Link
            href="https://merchant.razorpay.com/policy/PIWDOTtcAwgqpx/terms"
            className="hover:underline"
          >
            Terms of Service
          </Link>
          <Link
            href="https://merchant.razorpay.com/policy/PIWDOTtcAwgqpx/terms"
            className="hover:underline"
          >
            Policy & Privacy
          </Link>
          <Link
            href="https://merchant.razorpay.com/policy/PIWDOTtcAwgqpx/refund"
            className="hover:underline"
          >
            Cancellation & Return
          </Link>
          <Link
            href="https://merchant.razorpay.com/policy/PIWDOTtcAwgqpx/shipping"
            className="hover:underline"
          >
            Shipping and Delivery policy
          </Link>
          <span className="hover:underline cursor-pointer">+91 9652389981</span>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-xs mt-4 sm:mt-0">
          ©️ {new Date().getFullYear()} Tora. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
