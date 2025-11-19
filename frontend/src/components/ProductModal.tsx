import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { FiStar, FiShoppingCart, FiHeart, FiCopy } from 'react-icons/fi';
import { FaWhatsapp, FaStar } from 'react-icons/fa';
import Button from './ui/Button';
import { useFavorites } from '../context/FavoriteContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api, { getImageUrl } from '../utils/api';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../utils/placeholder';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

interface Product {
  _id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: { url: string; alt: string }[];
  videos?: { url: string; title: string }[];
  specifications?: Record<string, string>;
  rating: { average: number; count: number };
  category?: { _id: string; name: string };
}

interface Review {
  _id: string;
  user: { name: string };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderClick?: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onOrderClick }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();

  useEffect(() => {
    if (product && isOpen) {
      fetchReviews();
    }
  }, [product, isOpen]);

  const fetchReviews = async () => {
    if (!product) return;
    
    try {
      setLoadingReviews(true);
      const response = await api.get(`/reviews/products/${product._id}`);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (!product) return null;

  const favorite = isFavorite(product._id);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleFavoriteClick = async () => {
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

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(product.code);
    toast.success('Product code copied!');
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in:\n\n📦 ${product.name}\n🔢 Code: ${product.code}\n💰 Price: Rs. ${product.price.toFixed(2)}\n📦 Quantity: ${quantity}\n\nCould you provide more information?`;
    const url = `https://wa.me/9779806812433?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Images */}
        <div>
          {/* Main Image Carousel */}
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            navigation
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            className="mb-4 rounded-lg overflow-hidden"
          >
            {product.images?.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={getImageUrl(image.url) || PLACEHOLDER_PRODUCT_IMAGE}
                  alt={image.alt || product.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_PRODUCT_IMAGE;
                  }}
                />
              </SwiperSlide>
            ))}
            {product.videos?.map((video, index) => (
              <SwiperSlide key={`video-${index}`}>
                <video
                  src={video.url}
                  controls
                  className="w-full h-96 object-cover"
                  title={video.title}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <Swiper
              modules={[Thumbs]}
              watchSlidesProgress
              onSwiper={setThumbsSwiper}
              slidesPerView={4}
              spaceBetween={10}
              className="cursor-pointer"
            >
              {product.images?.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={getImageUrl(image.url) || PLACEHOLDER_PRODUCT_IMAGE}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover rounded border-2 border-transparent hover:border-indigo-500"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_PRODUCT_IMAGE;
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Right: Product Info */}
        <div>
          {/* Category */}
          {product.category && (
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{product.category.name}</p>
          )}

          {/* Product Name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>

          {/* Product Code */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600 font-mono">#{product.code}</span>
            <button
              onClick={handleCopyCode}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Copy product code"
            >
              <FiCopy size={14} />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={18}
                  className={star <= Math.round(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-indigo-600">Rs. {product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-500 line-through">Rs. {product.comparePrice.toFixed(2)}</span>
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">-{discount}%</span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {product.stock === 0 ? (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            ) : product.stock <= 10 ? (
              <span className="text-orange-600 font-semibold">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-green-600 font-semibold">In Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={product.stock === 0}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                min="1"
                max={product.stock}
                disabled={product.stock === 0}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={product.stock === 0 || quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              fullWidth
              variant="primary"
            >
              <FiShoppingCart className="mr-2" />
              Add to Cart
            </Button>

            <button
              onClick={handleFavoriteClick}
              className={`p-3 border-2 rounded-lg transition-colors ${
                favorite
                  ? 'border-red-500 text-red-500 bg-red-50'
                  : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
              }`}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FiHeart size={24} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* WhatsApp & Order Buttons */}
          <div className="flex gap-3 mb-6">
            <Button onClick={handleWhatsApp} variant="success" fullWidth>
              <FaWhatsapp className="mr-2" size={20} />
              WhatsApp Order
            </Button>

            {onOrderClick && (
              <Button onClick={onOrderClick} variant="outline" fullWidth>
                Order Now
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-t pt-6">
            <div className="flex gap-4 border-b mb-4">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === 'specifications'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews ({product.rating.count})
              </button>
            </div>

            {/* Tab Content */}
            <div className="max-h-64 overflow-y-auto">
              {activeTab === 'description' && (
                <div className="text-gray-700 text-sm leading-relaxed">{product.description}</div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-2">
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No specifications available</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {loadingReviews ? (
                    <p className="text-gray-500">Loading reviews...</p>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                size={14}
                                className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-sm">{review.user.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && <h4 className="font-semibold text-sm mb-1">{review.title}</h4>}
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No reviews yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
