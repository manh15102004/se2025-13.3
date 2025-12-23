#!/usr/bin/env pwsh

# Shopee Clone - Useful Commands

# ============================================================
# DEVELOPMENT SERVER
# ============================================================

# Start development server
# npm run dev

# Start on different port
# npm run dev -- -p 3001

# ============================================================
# BUILDING & DEPLOYMENT
# ============================================================

# Build for production
# npm run build

# Start production server
# npm start

# Analyze build
# npm run build -- --debug

# ============================================================
# DATABASE COMMANDS
# ============================================================

# Start MongoDB locally
# mongod

# Connect to MongoDB
# mongosh "mongodb://localhost:27017/shopee-clone"

# Clear MongoDB collections
# db.users.deleteMany({})
# db.products.deleteMany({})
# db.orders.deleteMany({})

# ============================================================
# API TESTING - GET PRODUCTS
# ============================================================

# curl http://localhost:3000/api/products

# curl "http://localhost:3000/api/products?page=1&limit=10"

# curl "http://localhost:3000/api/products?category=electronics"

# ============================================================
# API TESTING - PRODUCTS
# ============================================================

# Get product by ID
# curl http://localhost:3000/api/products/[id]

# Create new product
# curl -X POST http://localhost:3000/api/products `
#   -H "Content-Type: application/json" `
#   -d '{
#     "name":"New Product",
#     "description":"Product description",
#     "price":100000,
#     "category":"electronics",
#     "images":["https://example.com/image.jpg"],
#     "stock":50,
#     "seller":"Test Seller"
#   }'

# Update product
# curl -X PUT http://localhost:3000/api/products/[id] `
#   -H "Content-Type: application/json" `
#   -d '{"price":90000,"stock":40}'

# Delete product
# curl -X DELETE http://localhost:3000/api/products/[id]

# ============================================================
# API TESTING - AUTHENTICATION
# ============================================================

# Register user
# curl -X POST http://localhost:3000/api/auth/register `
#   -H "Content-Type: application/json" `
#   -d '{
#     "email":"user@example.com",
#     "password":"password123",
#     "name":"John Doe"
#   }'

# Login user
# curl -X POST http://localhost:3000/api/auth/login `
#   -H "Content-Type: application/json" `
#   -d '{
#     "email":"user@example.com",
#     "password":"password123"
#   }'

# ============================================================
# API TESTING - ORDERS
# ============================================================

# Create order
# curl -X POST http://localhost:3000/api/orders `
#   -H "Content-Type: application/json" `
#   -d '{
#     "userId":"user123",
#     "items":[
#       {
#         "productId":"1",
#         "name":"Product Name",
#         "price":100000,
#         "quantity":2,
#         "image":"https://example.com/image.jpg"
#       }
#     ],
#     "totalAmount":200000,
#     "shippingAddress":"123 Street, City",
#     "paymentMethod":"card"
#   }'

# ============================================================
# LINTING & CODE QUALITY
# ============================================================

# Run ESLint
# npm run lint

# Fix ESLint issues
# npx eslint --fix src/

# ============================================================
# TESTING
# ============================================================

# Run tests (if configured)
# npm test

# Run tests in watch mode
# npm test -- --watch

# ============================================================
# DEPENDENCIES
# ============================================================

# Install all dependencies
# npm install

# Add new package
# npm install package-name

# Install dev dependency
# npm install --save-dev package-name

# Update dependencies
# npm update

# Check outdated packages
# npm outdated

# Audit dependencies
# npm audit

# Fix vulnerabilities
# npm audit fix

# ============================================================
# GIT COMMANDS
# ============================================================

# Initialize git
# git init

# Add files
# git add .

# Commit changes
# git commit -m "message"

# View status
# git status

# View log
# git log

# ============================================================
# USEFUL SHORTCUTS
# ============================================================

# Quick terminal commands:
# Clear screen: Clear-Host
# Navigate to project: cd C:\Users\Quan\PycharmProjects\shopee-clone
# Open in Explorer: explorer .
# Open VS Code: code .

# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

# .env.local should contain:
# MONGODB_URI=mongodb://localhost:27017/shopee-clone
# JWT_SECRET=your-secret-key-change-this-in-production
# NEXT_PUBLIC_API_URL=http://localhost:3000

# ============================================================
# USEFUL LINKS
# ============================================================

# Local Development: http://localhost:3000
# MongoDB Docs: https://docs.mongodb.com/
# Next.js Docs: https://nextjs.org/docs
# React Docs: https://react.dev
# TypeScript Docs: https://www.typescriptlang.org/docs
# Tailwind CSS Docs: https://tailwindcss.com/docs
# Zustand Docs: https://github.com/pmndrs/zustand

# ============================================================
# FILE ORGANIZATION
# ============================================================

# Add new page:
# Create: src/app/newpage/page.tsx

# Add new component:
# Create: src/components/NewComponent.tsx

# Add new API route:
# Create: src/app/api/route/route.ts

# Add new model:
# Create: src/models/NewModel.ts

# Add new store:
# Create: src/stores/newStore.ts

# ============================================================
# DEPLOYMENT CHECKLIST
# ============================================================

# [ ] Update .env for production
# [ ] Build the project: npm run build
# [ ] Test production build: npm start
# [ ] Push to GitHub
# [ ] Deploy to Vercel or hosting platform
# [ ] Test all features on production
# [ ] Set up monitoring and logging
# [ ] Configure email notifications
# [ ] Set up payment processing
# [ ] Configure DNS if using custom domain

# ============================================================
# COMMON ISSUES & FIXES
# ============================================================

# Issue: Port 3000 already in use
# Fix: npm run dev -- -p 3001

# Issue: MongoDB connection error
# Fix: Ensure mongod is running, check MONGODB_URI

# Issue: Build fails
# Fix: rm -r .next && npm run build

# Issue: Module not found
# Fix: Check import paths, ensure files exist

# Issue: TypeScript errors
# Fix: npm run build to see errors, fix type issues

# ============================================================

Write-Host "Shopee Clone Commands - Reference Guide" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Common Commands:" -ForegroundColor Yellow
Write-Host "1. Start dev server: npm run dev" -ForegroundColor Cyan
Write-Host "2. Build project: npm run build" -ForegroundColor Cyan
Write-Host "3. Run linter: npm run lint" -ForegroundColor Cyan
Write-Host "4. Install deps: npm install" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Testing: Use curl commands above (uncomment them)" -ForegroundColor Yellow
Write-Host "Database: Start MongoDB with 'mongod' before running dev server" -ForegroundColor Yellow
Write-Host ""
