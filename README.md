# Shopee Clone - E-Commerce Platform

A modern e-commerce web application built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## 🚀 Features

- **Product Catalog**: Browse and search for products
- **Shopping Cart**: Add/remove items and manage quantities
- **User Authentication**: Register and login functionality
- **Order Management**: Create and track orders
- **Responsive Design**: Mobile-friendly interface
- **Admin Dashboard Ready**: Scalable architecture for admin features

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Payment Ready**: Stripe integration ready

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)

### Steps

1. **Clone or navigate to the project directory**
```bash
cd shopee-clone
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` file:
```
MONGODB_URI=mongodb://localhost:27017/shopee-clone
JWT_SECRET=your-secret-key-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env.local
```

5. **Run the development server**
```bash
# normal dev
npm run dev
# or listen on all interfaces so other devices on the same LAN can access
npm run dev:host
```

6. **Open your browser**
Navigate to `http://localhost:3000` or (from another device on the same Wi‑Fi) `http://<YOUR_COMPUTER_IP>:3000`.

7. **Access from your phone**
- Find your computer IP with `ipconfig` (Windows) or `ifconfig`/`ip a` (macOS/Linux) and use `http://<IP>:3000` on your phone's browser.  
- If you need to access from outside your network, use ngrok: `npx ngrok http 3000` and open the generated HTTPS URL.

> Tip: copy `.env.example` to `.env.local` and fill your local values.

## 📁 Project Structure

```
shopee-clone/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── cart/         # Cart page
│   │   ├── products/     # Products page
│   │   ├── account/      # Account page
│   │   └── auth/         # Auth pages
│   ├── components/       # React components
│   ├── models/           # MongoDB models
│   ├── stores/           # Zustand stores
│   └── lib/              # Utility functions
├── public/               # Static assets
├── .env.local            # Environment variables
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🔗 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Orders
- `POST /api/orders` - Create order

## 🎯 Usage Examples

### Add Product to Cart
```typescript
import { useCartStore } from '@/stores/cartStore';

const addItem = useCartStore((state) => state.addItem);

addItem({
  productId: '123',
  name: 'Product Name',
  price: 100000,
  quantity: 1,
  image: 'image-url'
});
```

### Fetch Products
```typescript
const response = await fetch('/api/products?page=1&limit=20');
const data = await response.json();
```

### Create Order
```typescript
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-id',
    items: [...],
    totalAmount: 1000000,
    shippingAddress: 'Address',
    paymentMethod: 'card'
  })
});
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

```bash
vercel
```

### Environment Variables for Production
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong secret key (use random string)
- `NEXT_PUBLIC_API_URL` - Your production URL

## 📝 Next Steps

- [ ] Add more product categories
- [ ] Implement payment processing (Stripe)
- [ ] Add product reviews and ratings
- [ ] Create admin dashboard
- [ ] Implement email notifications
- [ ] Add search and filtering
- [ ] Optimize images with Next.js Image
- [ ] Implement wishlist feature
- [ ] Add product recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For support, email support@shopeeclone.local or open an issue in the repository.

---

**Happy Shopping!** 🛍️

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
