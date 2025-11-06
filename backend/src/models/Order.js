import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: String,
        unit_price: Number,
        quantity: Number,
      },
    ],
    buyer: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      notes: String,
    },
    total: Number,
    status: { 
      type: String, 
      enum: ["pending", "paid", "failed", "processing", "shipped", "delivered"], 
      default: "pending" 
    },
    external_reference: String, // para enlazar con Mercado Pago
    mp_preference_id: String,
    mp_payment_id: String,
  },
  { timestamps: true }
);

// Índices para mejorar rendimiento de consultas
orderSchema.index({ createdAt: -1 });
orderSchema.index({ external_reference: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "buyer.email": 1 });

export default mongoose.model("Order", orderSchema);
