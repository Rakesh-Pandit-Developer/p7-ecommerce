import React from 'react';
import { FiShoppingBag, FiTruck, FiCreditCard, FiShield } from 'react-icons/fi';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About E-Shop</h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            Your trusted online shopping destination for quality products at great prices
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Our Story */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="text-gray-700 space-y-4 leading-relaxed">
            <p>
              Welcome to E-Shop, your number one source for all things shopping. We're dedicated to 
              providing you the very best of products, with an emphasis on quality, customer service, 
              and uniqueness.
            </p>
            <p>
              Founded in 2024, E-Shop has come a long way from its beginnings. When we first started out, 
              our passion for providing the best shopping experience drove us to start our own business.
            </p>
            <p>
              We now serve customers all over the region and are thrilled that we're able to turn our 
              passion into our own website. We hope you enjoy our products as much as we enjoy offering 
              them to you.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingBag className="text-indigo-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Wide Selection</h3>
            <p className="text-gray-600">
              Thousands of products across multiple categories
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTruck className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Quick and reliable shipping to your doorstep
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCreditCard className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-gray-600">
              Safe and secure payment options for your peace of mind
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-purple-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Guarantee</h3>
            <p className="text-gray-600">
              100% authentic products with quality assurance
            </p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To provide our customers with the best online shopping experience by offering quality 
              products, exceptional customer service, and competitive prices. We strive to make online 
              shopping accessible, convenient, and enjoyable for everyone.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span>Customer satisfaction is our top priority</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span>Integrity and transparency in all our dealings</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span>Commitment to quality and authenticity</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span>Continuous improvement and innovation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
