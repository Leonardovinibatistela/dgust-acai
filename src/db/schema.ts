import { pgTable, text, timestamp, integer, numeric, boolean, uuid, serial } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "garrafa" | "tradicional" | "barca_marmita" | "premium" | "sobremesa"
  image: text("image").notNull(),
  sizes: text("sizes").notNull(), // JSON string representing: Array<{ label: string, price: number }>
  freeToppingsLimit: integer("free_toppings_limit").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("4.8").notNull(),
  reviewsCount: integer("reviews_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // We can generate a random readable ID like DGUST-1234
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  customerCity: text("customer_city"),
  deliveryMethod: text("delivery_method").notNull(), // "delivery" | "pickup"
  paymentMethod: text("payment_method").notNull(), // "pix" | "card" | "cash"
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // "pending" | "preparing" | "delivering" | "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  freeToppings: text("free_toppings"), // JSON string array
  paidToppings: text("paid_toppings"), // JSON string array of { name: string, price: number }
});
