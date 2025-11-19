const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const Settings = require('./src/models/Settings');
const Order = require('./src/models/Order');
const Review = require('./src/models/Review');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Settings.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();

    console.log('Data cleared...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create demo user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Users created...');

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        active: true,
        order: 1,
      },
      {
        name: 'Clothing',
        description: 'Men and women clothing',
        slug: 'clothing',
        active: true,
        order: 2,
      },
      {
        name: 'Home & Garden',
        description: 'Home decor and garden supplies',
        slug: 'home-garden',
        active: true,
        order: 3,
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        slug: 'sports-outdoors',
        active: true,
        order: 4,
      },
      {
        name: 'Books',
        description: 'Books and educational materials',
        slug: 'books',
        active: true,
        order: 5,
      },
      {
        name: 'Beauty & Health',
        description: 'Beauty products and health supplements',
        slug: 'beauty-health',
        active: true,
        order: 6,
      },
      {
        name: 'Toys & Games',
        description: 'Toys and games for all ages',
        slug: 'toys-games',
        active: true,
        order: 7,
      },
      {
        name: 'Automotive',
        description: 'Car accessories and parts',
        slug: 'automotive',
        active: true,
        order: 8,
      },
    ]);

    console.log('Categories created...');

    // Create products
    const products = [];
    const productData = [
      {
        code: 'ELEC001',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
        price: 79.99,
        comparePrice: 99.99,
        stock: 50,
        category: categories[0]._id,
        featured: true,
        images: [
          { url: '/placeholder-headphones.jpg', alt: 'Wireless Headphones', isPrimary: true },
        ],
        specifications: new Map([
          ['Battery Life', '30 hours'],
          ['Connectivity', 'Bluetooth 5.0'],
          ['Weight', '250g'],
          ['Color', 'Black'],
        ]),
        tags: ['electronics', 'audio', 'wireless', 'headphones'],
      },
      {
        code: 'ELEC002',
        name: 'Smartphone Pro Max',
        description: '6.7-inch OLED display, 5G enabled, triple camera system with 108MP main sensor, 8GB RAM, 256GB storage.',
        price: 899.99,
        comparePrice: 1099.99,
        stock: 30,
        category: categories[0]._id,
        featured: true,
        images: [
          { url: '/placeholder-phone.jpg', alt: 'Smartphone', isPrimary: true },
        ],
        specifications: new Map([
          ['Display', '6.7" OLED'],
          ['RAM', '8GB'],
          ['Storage', '256GB'],
          ['Camera', '108MP'],
        ]),
        tags: ['electronics', 'smartphone', '5g'],
      },
      {
        code: 'CLTH001',
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt, available in multiple colors. Perfect for everyday wear.',
        price: 19.99,
        stock: 100,
        category: categories[1]._id,
        featured: true,
        images: [
          { url: '/placeholder-tshirt.jpg', alt: 'Cotton T-Shirt', isPrimary: true },
        ],
        specifications: new Map([
          ['Material', '100% Cotton'],
          ['Sizes', 'S, M, L, XL, XXL'],
          ['Care', 'Machine washable'],
        ]),
        tags: ['clothing', 'tshirt', 'cotton'],
      },
      {
        code: 'HOME001',
        name: 'Modern Table Lamp',
        description: 'Sleek and modern table lamp with adjustable brightness, USB charging port, and touch control.',
        price: 45.99,
        stock: 25,
        category: categories[2]._id,
        featured: true,
        images: [
          { url: '/placeholder-lamp.jpg', alt: 'Table Lamp', isPrimary: true },
        ],
        specifications: new Map([
          ['Power', '15W LED'],
          ['Height', '45cm'],
          ['Features', 'Touch control, USB port'],
        ]),
        tags: ['home', 'lighting', 'lamp'],
      },
      {
        code: 'SPRT001',
        name: 'Yoga Mat Pro',
        description: 'Extra thick 6mm yoga mat, non-slip surface, eco-friendly materials, includes carrying strap.',
        price: 34.99,
        stock: 40,
        category: categories[3]._id,
        featured: true,
        images: [
          { url: '/placeholder-yogamat.jpg', alt: 'Yoga Mat', isPrimary: true },
        ],
        specifications: new Map([
          ['Thickness', '6mm'],
          ['Dimensions', '183cm x 61cm'],
          ['Material', 'TPE eco-friendly'],
        ]),
        tags: ['sports', 'yoga', 'fitness'],
      },
      {
        code: 'BOOK001',
        name: 'JavaScript Complete Guide',
        description: 'Comprehensive guide to modern JavaScript programming, from basics to advanced concepts. Perfect for beginners and intermediate developers.',
        price: 29.99,
        stock: 60,
        category: categories[4]._id,
        featured: true,
        images: [
          { url: '/placeholder-book.jpg', alt: 'JavaScript Book', isPrimary: true },
        ],
        specifications: new Map([
          ['Pages', '850'],
          ['Publisher', 'Tech Books'],
          ['Edition', '2024'],
        ]),
        tags: ['books', 'programming', 'javascript'],
      },
      {
        code: 'ELEC003',
        name: 'Wireless Gaming Mouse',
        description: 'High-precision wireless gaming mouse with 16000 DPI, RGB lighting, and ergonomic design.',
        price: 59.99,
        stock: 35,
        category: categories[0]._id,
        featured: true,
        images: [
          { url: '/placeholder-mouse.jpg', alt: 'Gaming Mouse', isPrimary: true },
        ],
        tags: ['electronics', 'gaming', 'mouse'],
      },
      {
        code: 'CLTH002',
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans, comfortable and durable, perfect for casual wear.',
        price: 49.99,
        comparePrice: 69.99,
        stock: 55,
        category: categories[1]._id,
        featured: true,
        images: [
          { url: '/placeholder-jeans.jpg', alt: 'Denim Jeans', isPrimary: true },
        ],
        tags: ['clothing', 'jeans', 'denim'],
      },
      {
        code: 'HOME002',
        name: 'Coffee Maker Deluxe',
        description: 'Programmable coffee maker with 12-cup capacity, auto-shutoff, and reusable filter.',
        price: 79.99,
        stock: 20,
        category: categories[2]._id,
        featured: true,
        images: [
          { url: '/placeholder-coffee.jpg', alt: 'Coffee Maker', isPrimary: true },
        ],
        tags: ['home', 'kitchen', 'coffee'],
      },
      {
        code: 'SPRT002',
        name: 'Running Shoes Pro',
        description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.',
        price: 89.99,
        stock: 45,
        category: categories[3]._id,
        featured: true,
        images: [
          { url: '/placeholder-shoes.jpg', alt: 'Running Shoes', isPrimary: true },
        ],
        tags: ['sports', 'running', 'shoes'],
      },
      // Additional products
      {
        code: 'ELEC004',
        name: '4K Smart TV 55"',
        description: '55-inch 4K Ultra HD Smart TV with HDR, built-in streaming apps.',
        price: 499.99,
        stock: 15,
        category: categories[0]._id,
        images: [{ url: '/placeholder-tv.jpg', alt: 'Smart TV', isPrimary: true }],
      },
      {
        code: 'CLTH003',
        name: 'Winter Jacket',
        description: 'Warm winter jacket with hood, waterproof and windproof.',
        price: 129.99,
        stock: 30,
        category: categories[1]._id,
        images: [{ url: '/placeholder-jacket.jpg', alt: 'Winter Jacket', isPrimary: true }],
      },
      {
        code: 'HOME003',
        name: 'Memory Foam Pillow',
        description: 'Ergonomic memory foam pillow for better sleep quality.',
        price: 39.99,
        stock: 60,
        category: categories[2]._id,
        images: [{ url: '/placeholder-pillow.jpg', alt: 'Memory Foam Pillow', isPrimary: true }],
      },
      {
        code: 'SPRT003',
        name: 'Dumbbells Set 20kg',
        description: 'Adjustable dumbbell set with stand, perfect for home workouts.',
        price: 149.99,
        stock: 25,
        category: categories[3]._id,
        images: [{ url: '/placeholder-dumbbells.jpg', alt: 'Dumbbells', isPrimary: true }],
      },
      {
        code: 'BOOK002',
        name: 'Python for Beginners',
        description: 'Learn Python programming from scratch with practical examples.',
        price: 34.99,
        stock: 50,
        category: categories[4]._id,
        images: [{ url: '/placeholder-python-book.jpg', alt: 'Python Book', isPrimary: true }],
      },
      {
        code: 'BEAU001',
        name: 'Facial Care Set',
        description: 'Complete facial care set with cleanser, toner, and moisturizer.',
        price: 59.99,
        stock: 40,
        category: categories[5]._id,
        images: [{ url: '/placeholder-facial.jpg', alt: 'Facial Care', isPrimary: true }],
      },
      {
        code: 'TOYS001',
        name: 'Building Blocks Set',
        description: '500-piece building blocks set for creative play.',
        price: 44.99,
        stock: 35,
        category: categories[6]._id,
        images: [{ url: '/placeholder-blocks.jpg', alt: 'Building Blocks', isPrimary: true }],
      },
      {
        code: 'AUTO001',
        name: 'Car Phone Mount',
        description: 'Universal car phone holder with 360-degree rotation.',
        price: 19.99,
        stock: 70,
        category: categories[7]._id,
        images: [{ url: '/placeholder-mount.jpg', alt: 'Phone Mount', isPrimary: true }],
      },
      {
        code: 'ELEC005',
        name: 'Laptop Stand Adjustable',
        description: 'Ergonomic laptop stand with cooling fan and adjustable height.',
        price: 49.99,
        stock: 45,
        category: categories[0]._id,
        images: [{ url: '/placeholder-stand.jpg', alt: 'Laptop Stand', isPrimary: true }],
      },
      {
        code: 'CLTH004',
        name: 'Sports Shorts',
        description: 'Quick-dry sports shorts for running and gym workouts.',
        price: 24.99,
        stock: 80,
        category: categories[1]._id,
        images: [{ url: '/placeholder-shorts.jpg', alt: 'Sports Shorts', isPrimary: true }],
      },
      {
        code: 'HOME004',
        name: 'Air Purifier',
        description: 'HEPA air purifier for clean and fresh indoor air.',
        price: 149.99,
        stock: 20,
        category: categories[2]._id,
        images: [{ url: '/placeholder-purifier.jpg', alt: 'Air Purifier', isPrimary: true }],
      },
    ];

    for (const data of productData) {
      const product = await Product.create(data);
      products.push(product);
    }

    console.log('Products created...');

    // Create sample reviews
    const reviews = await Review.insertMany([
      {
        product: products[0]._id,
        user: user._id,
        rating: 5,
        comment: 'Amazing headphones! Sound quality is incredible and battery lasts forever.',
      },
      {
        product: products[1]._id,
        user: user._id,
        rating: 4,
        comment: 'Great phone, but a bit pricey. Camera quality is outstanding.',
      },
      {
        product: products[2]._id,
        user: user._id,
        rating: 5,
        comment: 'Very comfortable t-shirt, fits perfectly. Will buy more colors!',
      },
      {
        product: products[0]._id,
        user: admin._id,
        rating: 5,
        comment: 'Best purchase I made this year. Highly recommended!',
      },
    ]);

    // Update product ratings
    for (const product of products.slice(0, 3)) {
      const productReviews = reviews.filter(r => r.product.equals(product._id));
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        product.rating = {
          average: avgRating,
          count: productReviews.length,
        };
        await product.save();
      }
    }

    console.log('Reviews created...');

    // Create sample orders
    const orderNumber = `ORD${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}0001`;
    
    await Order.insertMany([
      {
        orderNumber,
        user: user._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].price,
          },
          {
            product: products[2]._id,
            quantity: 2,
            price: products[2].price,
          },
        ],
        totalAmount: products[0].price + (products[2].price * 2),
        customerInfo: {
          name: 'John Doe',
          email: 'user@example.com',
          phone: '1234567890',
          address: '123 Main St, New York, NY 10001, USA',
        },
        paymentMethod: 'half-payment',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      },
      {
        orderNumber: `ORD${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}0002`,
        user: user._id,
        items: [
          {
            product: products[1]._id,
            quantity: 1,
            price: products[1].price,
          },
        ],
        totalAmount: products[1].price,
        customerInfo: {
          name: 'John Doe',
          email: 'user@example.com',
          phone: '1234567890',
          address: '123 Main St, New York, NY 10001, USA',
        },
        paymentMethod: 'full-payment',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
      },
    ]);

    console.log('Orders created...');

    // Create settings
    await Settings.insertMany([
      {
        key: 'company_name',
        value: 'E-Commerce Store',
        category: 'general',
        description: 'Company name displayed on site',
      },
      {
        key: 'owner_email',
        value: process.env.OWNER_EMAIL || 'owner@example.com',
        category: 'email',
        description: 'Owner email for order notifications',
      },
      {
        key: 'whatsapp_number',
        value: process.env.WHATSAPP_NUMBER || '',
        category: 'whatsapp',
        description: 'WhatsApp number for customer support',
      },
      {
        key: 'qr_image_url',
        value: process.env.QR_IMAGE_URL || '',
        category: 'payment',
        description: 'QR code image URL for payments',
      },
      {
        key: 'bank_info',
        value: process.env.BANK_INFO || '',
        category: 'payment',
        description: 'Bank account information for transfers',
      },
    ]);

    console.log('Settings created...');

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log('\n👤 Admin Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n👤 Demo User Credentials:');
    console.log('   Email: user@example.com');
    console.log('   Password: user123');
    console.log('\n📊 Seeded Data:');
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - ${reviews.length} Reviews`);
    console.log('   - 2 Sample Orders');
    console.log('   - App Settings');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
