require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  try {
    console.log('Starting database seeding...');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    console.log('Creating users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .insert([
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password: adminPassword,
          role: 'admin',
          phone: '+1234567890',
          address: '123 Admin St, City, Country'
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword,
          role: 'user',
          phone: '+1234567891',
          address: '456 User Ave, City, Country'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: hashedPassword,
          role: 'user',
          phone: '+1234567892',
          address: '789 Customer Blvd, City, Country'
        },
        {
          name: 'Bob Wilson',
          email: 'bob@example.com',
          password: hashedPassword,
          role: 'user',
          phone: '+1234567893',
          address: '321 Buyer Lane, City, Country'
        }
      ])
      .select();

    if (usersError) {
      console.error('Error creating users:', usersError);
      throw usersError;
    }
    console.log(`Created ${users.length} users`);

    console.log('Creating categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        {
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
          active: true
        },
        {
          name: 'Clothing',
          description: 'Fashion and apparel',
          active: true
        },
        {
          name: 'Home & Garden',
          description: 'Home improvement and garden supplies',
          active: true
        },
        {
          name: 'Sports & Outdoors',
          description: 'Sports equipment and outdoor gear',
          active: true
        },
        {
          name: 'Books',
          description: 'Books and literature',
          active: true
        },
        {
          name: 'Toys & Games',
          description: 'Toys, games, and entertainment',
          active: true
        }
      ])
      .select();

    if (categoriesError) {
      console.error('Error creating categories:', categoriesError);
      throw categoriesError;
    }
    console.log(`Created ${categories.length} categories`);

    console.log('Creating products...');
    const products = [
      {
        code: 'ELEC001',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        specifications: { battery: '30 hours', bluetooth: '5.0', weight: '250g' },
        price: 99.99,
        compare_price: 149.99,
        stock: 50,
        category_id: categories.find(c => c.name === 'Electronics').id,
        images: [
          { url: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg', alt: 'Wireless Headphones', isPrimary: true }
        ],
        featured: true,
        active: true,
        tags: ['wireless', 'audio', 'bluetooth']
      },
      {
        code: 'ELEC002',
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with fitness tracking',
        specifications: { display: 'AMOLED', battery: '48 hours', waterproof: 'IP68' },
        price: 199.99,
        compare_price: 249.99,
        stock: 30,
        category_id: categories.find(c => c.name === 'Electronics').id,
        images: [
          { url: 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg', alt: 'Smart Watch', isPrimary: true }
        ],
        featured: true,
        active: true,
        tags: ['smartwatch', 'fitness', 'wearable']
      },
      {
        code: 'CLOTH001',
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt',
        specifications: { material: '100% Cotton', sizes: 'S, M, L, XL', care: 'Machine wash' },
        price: 19.99,
        stock: 100,
        category_id: categories.find(c => c.name === 'Clothing').id,
        images: [
          { url: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg', alt: 'Cotton T-Shirt', isPrimary: true }
        ],
        active: true,
        tags: ['clothing', 'casual', 'cotton']
      },
      {
        code: 'CLOTH002',
        name: 'Denim Jeans',
        description: 'Classic blue denim jeans',
        specifications: { material: 'Denim', fit: 'Regular', wash: 'Medium blue' },
        price: 49.99,
        compare_price: 69.99,
        stock: 75,
        category_id: categories.find(c => c.name === 'Clothing').id,
        images: [
          { url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg', alt: 'Denim Jeans', isPrimary: true }
        ],
        active: true,
        tags: ['jeans', 'denim', 'casual']
      },
      {
        code: 'HOME001',
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with thermal carafe',
        specifications: { capacity: '12 cups', programmable: 'Yes', auto_shutoff: 'Yes' },
        price: 79.99,
        stock: 25,
        category_id: categories.find(c => c.name === 'Home & Garden').id,
        images: [
          { url: 'https://images.pexels.com/photos/4349776/pexels-photo-4349776.jpeg', alt: 'Coffee Maker', isPrimary: true }
        ],
        featured: true,
        active: true,
        tags: ['appliance', 'kitchen', 'coffee']
      },
      {
        code: 'SPORT001',
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap',
        specifications: { thickness: '6mm', material: 'TPE', size: '183cm x 61cm' },
        price: 29.99,
        stock: 60,
        category_id: categories.find(c => c.name === 'Sports & Outdoors').id,
        images: [
          { url: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg', alt: 'Yoga Mat', isPrimary: true }
        ],
        active: true,
        tags: ['fitness', 'yoga', 'exercise']
      },
      {
        code: 'BOOK001',
        name: 'Programming Guide',
        description: 'Comprehensive guide to modern programming',
        specifications: { pages: '500', format: 'Paperback', language: 'English' },
        price: 34.99,
        stock: 40,
        category_id: categories.find(c => c.name === 'Books').id,
        images: [
          { url: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg', alt: 'Programming Guide', isPrimary: true }
        ],
        active: true,
        tags: ['book', 'programming', 'education']
      },
      {
        code: 'TOY001',
        name: 'Building Blocks Set',
        description: 'Creative building blocks for kids',
        specifications: { pieces: '500', age: '6+', material: 'Plastic' },
        price: 39.99,
        stock: 45,
        category_id: categories.find(c => c.name === 'Toys & Games').id,
        images: [
          { url: 'https://images.pexels.com/photos/1619844/pexels-photo-1619844.jpeg', alt: 'Building Blocks', isPrimary: true }
        ],
        active: true,
        tags: ['toy', 'kids', 'educational']
      }
    ];

    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (productsError) {
      console.error('Error creating products:', productsError);
      throw productsError;
    }
    console.log(`Created ${insertedProducts.length} products`);

    console.log('Creating reviews...');
    const regularUsers = users.filter(u => u.role === 'user');
    const reviews = [];

    for (let i = 0; i < Math.min(3, insertedProducts.length); i++) {
      reviews.push({
        product_id: insertedProducts[i].id,
        user_id: regularUsers[i % regularUsers.length].id,
        rating: 4 + Math.floor(Math.random() * 2),
        comment: 'Great product! Highly recommend it.'
      });
    }

    const { data: insertedReviews, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviews)
      .select();

    if (reviewsError) {
      console.error('Error creating reviews:', reviewsError);
      throw reviewsError;
    }
    console.log(`Created ${insertedReviews.length} reviews`);

    console.log('Creating settings...');
    const { error: settingsError } = await supabase
      .from('settings')
      .insert([
        {
          key: 'site_name',
          value: { text: 'E-Commerce Store' }
        },
        {
          key: 'currency',
          value: { code: 'USD', symbol: '$' }
        }
      ]);

    if (settingsError && settingsError.code !== '23505') {
      console.error('Error creating settings:', settingsError);
      throw settingsError;
    }
    console.log('Created settings');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('User: bob@example.com / password123');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
