import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String }, // URL de imagen
    stock: { type: Number, default: 0 },
    sku: { type: String },
    description: { type: String }, // Descripción corta
    
    // Especificaciones detalladas
    specs: {
      brand: String,        // Marca (Apple, Samsung, etc)
      model: String,        // Modelo específico
      color: String,        // Color
      material: String,     // Material
      compatibility: String, // Compatible con...
      warranty: String,     // Garantía
      features: [String],   // Características ["USB-C", "Carga rápida"]
    },
    
    // Categoría
    category: { 
      type: String, 
      enum: ['celulares', 'audifonos', 'cargadores', 'cables', 'accesorios', 'protectores'],
      required: true 
    },
    
    // Preguntas frecuentes del producto
    faqs: [{
      question: String,
      answer: String
    }]
  },
  { timestamps: true }
);

// Índices para mejorar rendimiento de consultas
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ category: 1 });
productSchema.index({ title: "text", description: "text" });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ stock: 1, category: 1 });


export default mongoose.model("Product", productSchema);