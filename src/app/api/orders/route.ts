import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, items, totalAmount, shippingAddress, paymentMethod } = await request.json();

    // Validate stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Product ${item.name} is out of stock` },
          { status: 400 }
        );
      }
    }

    // Create order
    const order = await Order.create({
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: { stock: -item.quantity, sold: item.quantity },
        }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
