import Joi from "joi";

// Esquema para validar la creación de órdenes
export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().length(24).optional(),
        title: Joi.string().required().min(1).max(200),
        quantity: Joi.number().integer().min(1).max(999).required(),
        unit_price: Joi.number().positive().required(),
        image: Joi.string().uri().optional(),
      })
    )
    .min(1)
    .required(),
  buyer: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string()
      .pattern(/^[+]?[\d\s()-]{7,20}$/)
      .required()
      .messages({
        "string.pattern.base": "El teléfono debe ser válido",
      }),
    address: Joi.string().min(10).max(200).required(),
    city: Joi.string().min(2).max(100).required(),
    notes: Joi.string().max(500).optional().allow(''),
  }).required(),
});

// Esquema para validar la actualización de estado de órdenes
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "paid", "failed", "processing", "shipped", "delivered")
    .required(),
});

// Middleware para validar datos
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      return res.status(400).json({
        error: "Datos inválidos",
        details: errors,
      });
    }

    req.body = value;
    next();
  };
};
