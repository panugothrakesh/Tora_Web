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
          className="text-xl font-serif font-semibold hover:opacity-80 transition-all duration-300 ease-out cursor-pointer mb-4 sm:mb-0"
        >
          TORA
        </Link>

        {/* Links Section */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 sm:mt-0">
          <Link href="/about" className="hover:underline">
            About Us
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/faq" className="hover:underline">
            FAQ
          </Link>
          <Link href="/support" className="hover:underline">
            Support
          </Link>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-xs mt-4 sm:mt-0">
          © {new Date().getFullYear()} Tora. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
