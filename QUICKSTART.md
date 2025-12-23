# Quick Start Guide for Shopee Clone

## Prerequisites
- Node.js 18+ installed
- MongoDB (local or cloud - MongoDB Atlas)

## Setup Instructions

### 1. Navigate to project directory
```bash
cd C:\Users\Quan\PycharmProjects\shopee-clone
```

### 2. Install dependencies (if not already done)
```bash
npm install
```

### 3. Configure Environment Variables

Create or update `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/shopee-clone
JWT_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Start MongoDB (choose one)

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `MONGODB_URI` in `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

### 6. Open in Browser
Navigate to `http://localhost:3000`

## Features to Try

### Homepage
- View featured products
- See product categories
- Learn about the platform

### Product Listing
- Browse all products
- View product details
- Add items to cart

### Shopping Cart
- Add/remove products
- Adjust quantities
- See total price
- Checkout (demo)

### Account
- View account information
- Order history (placeholder)

## API Endpoints to Test

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "items":[{"productId":"1","name":"Product","price":100000,"quantity":1,"image":"url"}],
    "totalAmount":100000,
    "shippingAddress":"123 Street",
    "paymentMethod":"card"
  }'
```

## Project Structure

- `/src/app` - Page routes and API endpoints
- `/src/components` - React components (Header, Footer, ProductCard)
- `/src/models` - MongoDB models (User, Product, Order)
- `/src/stores` - Zustand state management (cartStore)
- `/src/lib` - Utilities (database, authentication)

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Try connecting with MongoDB Compass to test connection

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clear Next.js cache
rm -r .next

# Rebuild
npm run build
```

## Next Steps

- Implement user authentication UI
- Add product search and filtering
- Connect Stripe for payments
- Add email notifications
- Build admin dashboard
- Deploy to production

---

Happy Coding! 🚀
