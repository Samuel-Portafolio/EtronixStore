import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/db.js";
import Product from "../src/models/Product.js";

const PRODUCTS = [
  { title: "Cargador USB-C 20W", price: 45000, stock: 20, category: "cargadores" },
  { title: "Cable Lightning 1m", price: 35000, stock: 30, category: "cables" },
  { title: "Audífonos In-Ear", price: 60000, stock: 15, category: "audifonos" },
];

(async () => {
  await connectDB(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(PRODUCTS);
  console.log("Seed listo");
  process.exit(0);
})();
