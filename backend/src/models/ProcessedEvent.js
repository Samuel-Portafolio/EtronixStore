import mongoose from "mongoose";

const processedEventSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
    },
    notificationType: {
      type: String,
      required: true,
      enum: ["payment", "merchant_order"],
    },
    orderId: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ CORREGIDO: el índice unique ahora se aplica correctamente
// Antes: processedEventSchema.index({ notificationId: 1 }), { unique: true };
// El paréntesis mal puesto hacía que { unique: true } nunca se pasara al método
processedEventSchema.index({ notificationId: 1 }, { unique: true });

// Índice TTL para eliminar eventos antiguos automáticamente (30 días)
processedEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 2592000 });

const ProcessedEvent = mongoose.model("ProcessedEvent", processedEventSchema);

export default ProcessedEvent;