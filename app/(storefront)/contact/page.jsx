import React from "react";

export const metadata = {
  title: "Contact Us - GadgetStore",
  description:
    "Get in touch with GadgetStore. Reach our support team directly via phone or email for inquiries, order assistance, and customer support.",
};

const ContactPage = () => {
  return (
    <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 py-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Contact Us</h1>
        <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
      </div>

      <p className="mt-6 text-gray-600 max-w-2xl text-sm md:text-base leading-relaxed">
        We are here to assist you with any questions regarding our products, order status, or services.
        Reach out to the GadgetStore team through our direct contact channels below.
      </p>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full max-w-3xl">
        {/* Phone Contact */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Call Us</h2>
            <p className="text-sm text-gray-500 mb-4">
              Speak directly with our customer support team during business hours.
            </p>
          </div>
          <div>
            <a
              href="tel:+1-234-567-890"
              className="text-base font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              +1-234-567-890
            </a>
          </div>
        </div>

        {/* Email Contact */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Us</h2>
            <p className="text-sm text-gray-500 mb-4">
              Send your questions or feedback and our team will get back to you promptly.
            </p>
          </div>
          <div>
            <a
              href="mailto:contact@gadgetstore.dev"
              className="text-base font-medium text-orange-600 hover:text-orange-700 hover:underline"
            >
              contact@gadgetstore.dev
            </a>
          </div>
        </div>
      </div>

      {/* Support Hours / Information Notice */}
      <div className="mt-12 bg-gray-50 border border-gray-200/80 rounded-lg p-6 max-w-3xl w-full">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Care & Support Hours</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Our team is available Monday through Friday from 9:00 AM to 6:00 PM EST. For inquiries submitted outside of these hours, we will respond on the next business day.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
