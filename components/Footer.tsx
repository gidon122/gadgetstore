import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        <div className="w-4/5">
          <Link
            href="/"
            className="cursor-pointer text-2xl md:text-3xl font-bold inline-block"
          >
            <span className="text-orange-500">Gadget</span>
            <span className="text-black">Store</span>
          </Link>
          <p className="mt-6 text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>

        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Company</h2>
            <ul className="text-sm space-y-2">
              <li>
                <Link className="hover:underline transition" href="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="hover:underline transition" href="/all-products">
                  Shop
                </Link>
              </li>
              <li>
                <Link className="hover:underline transition" href="/about">
                  About us
                </Link>
              </li>
              <li>
                <Link className="hover:underline transition" href="/contact">
                  Contact us
                </Link>
              </li>
              <li>
                <a className="hover:underline transition" href="#">
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>
                <a href="tel:+1-234-567-890" className="hover:underline transition">
                  +1-234-567-890
                </a>
              </p>
              <p>
                <a href="mailto:contact@gadgetstore.dev" className="hover:underline transition">
                  contact@gadgetstore.dev
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm">
        Copyright 2025 © GadgetStore.dev All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;