import React, { useState } from 'react';
import { FiHeart, FiShoppingCart, FiEye, FiCopy } from 'react-icons/fi';
import { FaWhatsapp, FaStar } from 'react-icons/fa';
import { useFavorites } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/api';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../utils/placeholder';

interface Product {
  _id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: { url: string; alt: string; isPrimary?: boolean }[];
  rating: { average: number; count: number };
  category?: { _id: string; name: string };
}

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.[1];
  const currentImage = isHovered && secondaryImage ? secondaryImage : primaryImage;

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const favorite = isFavorite(product._id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (favorite) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(product.code);
    toast.success('Product code copied!');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hi! I'm interested in:\n\n📦 ${product.name}\n🔢 Code: ${product.code}\n💰 Price: Rs. ${product.price.toFixed(2)}\n\nCould you provide more information?`;
    const url = `https://wa.me/9779806812433?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(product)}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
          -{discount}%
        </div>
      )}

      {/* Stock Badge */}
      {product.stock === 0 && (
        <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
          Out of Stock
        </div>
      )}
      {product.stock > 0 && product.stock <= 10 && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
          Low Stock
        </div>
      )}

      {/* Image */}
      <div className="relative h-64 bg-gray-100 overflow-hidden">
        <img
          src={getImageUrl(currentImage?.url) || PLACEHOLDER_PRODUCT_IMAGE}
          alt={currentImage?.alt || product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_PRODUCT_IMAGE;
          }}
        />

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={handleFavoriteClick}
            className={`p-3 bg-white rounded-full hover:bg-gray-100 transition-colors ${
              favorite ? 'text-red-500' : 'text-gray-700'
            }`}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiHeart size={20} fill={favorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="View details"
          >
            <FiEye size={20} />
          </button>

          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Add to cart"
            >
              <FiShoppingCart size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category.name}</p>
        )}

        {/* Product Code */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-600 font-mono">#{product.code}</span>
          <button
            onClick={handleCopyCode}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Copy product code"
          >
            <FiCopy size={12} />
          </button>
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 h-10">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={14}
                className={star <= Math.round(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({product.rating.count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-indigo-600">Rs. {product.price.toFixed(2)}</span>
          {product.comparePrice && (
            <span className="text-sm text-gray-500 line-through">Rs. {product.comparePrice.toFixed(2)}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>

          <button
            onClick={handleWhatsApp}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            aria-label="Order via WhatsApp"
          >
            <FaWhatsapp size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
