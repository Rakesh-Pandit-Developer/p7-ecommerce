# E-Commerce Platform - Quick Start Guide

## Backend Setup (Completed ✅)

### Prerequisites
- Node.js >= 16
- MongoDB running locally or remote connection string
- Redis (optional, for queue functionality)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Strong secret key for JWT
   - `EMAIL_*` - Email server credentials (optional)
   - `WHATSAPP_NUMBER` - WhatsApp business number
   - Other settings as needed

3. **Seed Database**
   ```bash
   npm run seed
   ```
   
   This creates:
   - Admin user: `admin@example.com` / `admin123`
   - Demo user: `user@example.com` / `user123`
   - 10 sample products
   - 5 categories
   - Default settings

4. **Start Server**
   ```bash
   npm run dev
   ```
   
   Server runs at: `http://localhost:5000`

### API Endpoints

#### Public
- `GET /api/products` - List products (with search, filters, pagination)
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - List categories
- `POST /api/orders` - Create order (with payment screenshot upload)

#### Authenticated
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `GET /api/favorites` - Get favorites
- `POST /api/favorites` - Add to favorites
- `POST /api/favorites/sync` - Sync local favorites
- `GET /api/orders` - User orders
- `POST /api/reviews` - Submit review

#### Admin Only
- `POST /api/products` - Create product (with images)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/admin/bulk-import` - Bulk import
- `GET /api/products/admin/low-stock` - Low stock alerts
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment status
- `GET /api/orders/admin/stats` - Order statistics
- `GET/PUT /api/settings/:key` - Manage settings

### Features Implemented

✅ **Product Management**
- Full CRUD with images
- Search by name/code
- Category filtering
- Price range filtering
- Stock tracking
- Featured products
- Bulk import/export
- Low stock alerts

✅ **Order System**
- Guest & authenticated ordering
- Half-payment support
- Payment screenshot upload
- Email notifications
- Google Sheets logging
- WhatsApp integration
- Status tracking

✅ **Shopping Features**
- Cart management
- Favorites/Wishlist
- Offline favorite sync
- Product reviews (with approval)

✅ **Admin Features**
- Role-based access control
- Audit logs
- Settings management
- Order management
- Review moderation

✅ **Integrations**
- Email (Nodemailer)
- Google Sheets (order logging)
- WhatsApp (message templates)
- Background queues (Bull + Redis)

### File Upload Structure
```
uploads/
├── products/      # Product images
├── payments/      # Payment screenshots
├── reviews/       # Review images
└── others/        # Miscellaneous uploads
```

### Testing API with cURL

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Get Featured Products:**
```bash
curl http://localhost:5000/api/products/featured?limit=10
```

## Frontend Setup (In Progress 🚧)

### Next Steps

The backend is complete and ready. For the frontend, you'll need to:

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install react-icons react-toastify swiper @headlessui/react
   ```

2. **Create Context Providers**
   - AuthContext (existing)
   - CartContext
   - FavoriteContext
   - ProductContext

3. **Build Core Components**
   - ProductCard
   - ProductModal
   - OrderForm
   - CategoryGrid
   - SearchBar
   - Filters

4. **Create Pages**
   - Home (featured products + categories)
   - Shop (all products with filters)
   - ProductDetail
   - Cart
   - Checkout
   - Dashboard (user)
   - Admin Panel

### Recommended Tech Stack (Frontend)
- React 18 + TypeScript ✅
- Vite ✅
- Tailwind CSS ✅
- React Router ✅
- Axios ✅
- React Icons (icons)
- React Toastify (notifications)
- Swiper (image carousels)
- Headless UI (modals, dropdowns)

## Production Deployment

### Environment Variables to Update
- Generate strong `JWT_SECRET`
- Update `CLIENT_URL` to production domain
- Configure email credentials
- Setup Google Sheets API credentials
- Configure WhatsApp business number
- Setup Redis instance
- Update CORS settings

### Security Checklist
- ✅ Helmet security headers
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Input validation
- ✅ File upload restrictions
- ✅ CORS configuration
- ✅ Admin role checks
- ✅ Audit logging

## Support & Documentation

- API runs on port 5000
- MongoDB connection required
- Redis optional (for queue features)
- Uploads stored locally (configure cloud storage for production)

## Known Limitations

- Redis required for queue functionality (optional but recommended)
- File uploads are local (should use S3/Cloudinary in production)
- Google Sheets requires API credentials configuration
- Email requires SMTP server configuration

---

**Backend Status:** ✅ **Production Ready**
**Frontend Status:** 🚧 **In Development**
