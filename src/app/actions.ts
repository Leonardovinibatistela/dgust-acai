"use server";

import { db } from "@/db";
import { products, reviews, orders, orderItems } from "@/db/schema";
import { seedIfEmpty } from "@/db/seed";
import { eq, desc, and, like, sql } from "drizzle-orm";

// Make sure database is seeded
async function ensureSeeded() {
  await seedIfEmpty();
}

export async function getProducts(category?: string, sortBy?: string, search?: string) {
  await ensureSeeded();

  try {
    let query = db.select().from(products);

    // Apply filters
    const conditions = [];
    if (category && category !== "todos") {
      conditions.push(eq(products.category, category));
    }
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    let results = await (conditions.length > 0 
      ? db.select().from(products).where(and(...conditions))
      : db.select().from(products));

    // Sort in memory/JS for flexibility with ratings and price ranges
    if (sortBy) {
      if (sortBy === "price_asc" || sortBy === "price_desc") {
        results.sort((a, b) => {
          const aPrices = JSON.parse(a.sizes);
          const bPrices = JSON.parse(b.sizes);
          const aMin = aPrices.length > 0 ? aPrices[0].price : 0;
          const bMin = bPrices.length > 0 ? bPrices[0].price : 0;
          return sortBy === "price_asc" ? aMin - bMin : bMin - aMin;
        });
      } else if (sortBy === "rating") {
        results.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      } else if (sortBy === "reviews") {
        results.sort((a, b) => b.reviewsCount - a.reviewsCount);
      } else if (sortBy === "name_asc") {
        results.sort((a, b) => a.name.localeCompare(b.name));
      }
    }

    return { success: true, products: results };
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return { success: false, error: error?.message || "Failed to fetch products" };
  }
}

export async function getProductById(id: string) {
  await ensureSeeded();

  try {
    const list = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (list.length === 0) {
      return { success: false, error: "Product not found" };
    }

    const product = list[0];
    const productReviews = await db.select().from(reviews).where(eq(reviews.productId, id)).orderBy(desc(reviews.createdAt));

    return { success: true, product, reviews: productReviews };
  } catch (error: any) {
    console.error("Error fetching product by ID:", error);
    return { success: false, error: error?.message || "Failed to fetch product" };
  }
}

export async function createReview(productId: string, author: string, rating: number, comment: string) {
  try {
    // Insert new review
    await db.insert(reviews).values({
      productId,
      author: author || "Anônimo",
      rating: Math.max(1, Math.min(5, rating)),
      comment: comment || "Amei!",
    });

    // Recalculate average rating and review count for the product
    const allReviews = await db.select().from(reviews).where(eq(reviews.productId, productId));
    const count = allReviews.length;
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await db.update(products)
      .set({
        rating: avg.toFixed(1),
        reviewsCount: count,
      })
      .where(eq(products.id, productId));

    return { success: true };
  } catch (error: any) {
    console.error("Error creating review:", error);
    return { success: false, error: error?.message || "Failed to submit review" };
  }
}

interface OrderItemInput {
  productId: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
  freeToppings: string[];
  paidToppings: Array<{ name: string; price: number }>;
}

export async function createOrder(orderData: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerCity?: string;
  deliveryMethod: string; // "delivery" | "pickup"
  paymentMethod: string; // "pix" | "card" | "cash"
  total: number;
  items: OrderItemInput[];
}) {
  try {
    // Generate a readable order ID: e.g. DGUST-123456
    const num = Math.floor(100000 + Math.random() * 900000);
    const orderId = `DGUST-${num}`;

    await db.insert(orders).values({
      id: orderId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress || "N/A",
      customerCity: orderData.customerCity || "N/A",
      deliveryMethod: orderData.deliveryMethod,
      paymentMethod: orderData.paymentMethod,
      total: orderData.total.toFixed(2),
      status: "pending",
    });

    for (const item of orderData.items) {
      await db.insert(orderItems).values({
        orderId: orderId,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price.toFixed(2),
        freeToppings: JSON.stringify(item.freeToppings),
        paidToppings: JSON.stringify(item.paidToppings),
      });
    }

    return { success: true, orderId };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: error?.message || "Failed to complete purchase" };
  }
}
