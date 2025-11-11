import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("Missing MONGODB_URI");
  
  const options = {
    maxPoolSize: 10, // Pool de conexiones
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Compresión de red
    compressors: ['zlib'],
    zlibCompressionLevel: 6,
  };
  
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, options);
  console.log("MongoDB conectado con optimizaciones");
}