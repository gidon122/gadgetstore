import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About Us - GadgetStore",
  description:
    "Learn more about GadgetStore, our mission to deliver quality tech gadgets, and our commitment to an exceptional customer experience.",
};

const AboutPage = () => {
  return (
    <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 py-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900">About Us</h1>
        <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
      </div>

      {/* Main Narrative */}
      <div className="mt-8 text-gray-600 space-y-4 max-w-3xl leading-relaxed text-sm md:text-base">
        <p>
          Welcome to <span className="font-semibold text-gray-900">GadgetStore</span>, your
          trusted destination for the latest in technology, electronics, and smart lifestyle
          devices. We are committed to making cutting-edge tech accessible, reliable, and
          effortless to acquire.
        </p>
        <p>
          From high-performance smartphones and laptops to studio-grade headphones, smartwatches,
          and everyday digital accessories, our curated catalog is built to satisfy both casual
          consumers and demanding tech enthusiasts.
        </p>
      </div>

      {/* What We Offer / Purpose */}
      <div className="mt-12 w-full">
        <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">What We Offer</h2>
        <div className="w-12 h-0.5 bg-orange-600 rounded-full mb-6"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Smart Devices</h3>
            <p className="text-sm text-gray-600">
              The latest smartphones, tablets, and smart wearables designed to keep you connected and productive on the go.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Laptops & Computers</h3>
            <p className="text-sm text-gray-600">
              High-powered ultrabooks, creator laptops, and essential computing gear engineered for performance.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Premium Audio</h3>
            <p className="text-sm text-gray-600">
              Immersive noise-cancelling headphones, wireless earbuds, and portable speakers for an uncompromising sound experience.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Cameras & Imaging</h3>
            <p className="text-sm text-gray-600">
              Professional cameras, lenses, and visual gear to capture your most memorable moments with precision.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Wearables & Watches</h3>
            <p className="text-sm text-gray-600">
              Advanced fitness trackers and smartwatches to manage your wellness, schedule, and notifications seamlessly.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Tech Accessories</h3>
            <p className="text-sm text-gray-600">
              Reliable chargers, cables, protective cases, and adapters designed for seamless daily utility.
            </p>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="mt-14 w-full">
        <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-2">Why Choose GadgetStore</h2>
        <div className="w-12 h-0.5 bg-orange-600 rounded-full mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mb-4">
              01
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Curated Selection</h3>
            <p className="text-sm text-gray-600">
              Every device in our inventory is thoroughly inspected to ensure authenticity, performance, and long-term durability.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mb-4">
              02
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Seamless Shopping</h3>
            <p className="text-sm text-gray-600">
              An intuitive shopping experience with transparent pricing, fast order processing, and reliable doorstep delivery.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-6">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold mb-4">
              03
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Dedicated Support</h3>
            <p className="text-sm text-gray-600">
              Our customer care team is always on standby to answer your questions and provide post-purchase assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-14 w-full bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg md:text-xl font-medium text-gray-900">Ready to upgrade your tech?</h3>
          <p className="text-sm text-gray-600 mt-1">Discover our complete range of devices and accessories today.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/all-products"
            className="px-6 py-2.5 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 transition"
          >
            Explore Shop
          </Link>
          <Link
            href="/contact"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-100 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
