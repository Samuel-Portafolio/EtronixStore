// backend/scripts/seedRealProducts.js
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/db.js";
import Product from "../src/models/Product.js";

const REAL_PRODUCTS = [
  {
    title: "Cargador USB-C 20W iPhone",
    price: 45000,
    stock: 20,
    category: "cargadores",
    image: "https://images.unsplash.com/photo-1591290619762-99aa4b43c597?w=600&h=600&fit=crop",
    description: "Cargador rápido original para iPhone con tecnología Power Delivery",
    specs: {
      brand: "Apple Compatible",
      model: "PD-20W",
      color: "Blanco",
      compatibility: "iPhone 8 en adelante, iPad",
      warranty: "6 meses",
      features: ["Carga rápida", "USB-C", "20W", "Protección contra sobrecarga"]
    },
    faqs: [
      { 
        question: "¿Es original?", 
        answer: "Es compatible de alta calidad, funciona igual que el original" 
      },
      { 
        question: "¿Cuánto tarda en cargar?", 
        answer: "Carga un iPhone 13 del 0% al 50% en 30 minutos" 
      }
    ]
  },
  {
    title: "Cable Lightning 1m Certificado",
    price: 35000,
    stock: 30,
    category: "cables",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop",
    description: "Cable Lightning certificado MFi, carga y sincronización rápida",
    specs: {
      brand: "Apple Certified",
      model: "MFi-1M",
      color: "Blanco",
      material: "Nylon trenzado",
      compatibility: "iPhone, iPad, iPod con conector Lightning",
      warranty: "1 año",
      features: ["Certificado MFi", "Resistente", "1 metro", "Carga rápida"]
    },
    faqs: [
      { 
        question: "¿Funciona con iPhone 15?", 
        answer: "No, iPhone 15 usa USB-C. Este es para modelos anteriores" 
      },
      { 
        question: "¿Es resistente?", 
        answer: "Sí, tiene refuerzo de nylon que lo hace más duradero" 
      }
    ]
  },
  {
    title: "Audífonos Bluetooth TWS",
    price: 85000,
    stock: 15,
    category: "audifonos",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    description: "Audífonos inalámbricos con cancelación de ruido y estuche de carga",
    specs: {
      brand: "Premium Audio",
      model: "TWS-Pro",
      color: "Negro/Blanco disponible",
      compatibility: "iOS y Android",
      warranty: "6 meses",
      features: [
        "Bluetooth 5.3",
        "Cancelación de ruido",
        "IPX4 resistente al agua",
        "30hrs batería total",
        "Touch controls"
      ]
    },
    faqs: [
      { 
        question: "¿Cuánto dura la batería?", 
        answer: "6 horas por carga, 30 horas con el estuche" 
      },
      { 
        question: "¿Sirven para hacer ejercicio?", 
        answer: "Sí, son resistentes al sudor (IPX4)" 
      }
    ]
  },
  {
    title: "Protector de Pantalla Vidrio Templado",
    price: 25000,
    stock: 50,
    category: "protectores",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop",
    description: "Protector de vidrio templado 9H con instalación fácil",
    specs: {
      brand: "ScreenGuard",
      model: "9H-Ultra",
      compatibility: "Especificar modelo al comprar",
      warranty: "Garantía de instalación",
      features: [
        "Dureza 9H",
        "Anti-rayones",
        "Oleofóbico",
        "Ultra transparente",
        "Fácil instalación"
      ]
    },
    faqs: [
      { 
        question: "¿Afecta el touch?", 
        answer: "No, mantiene la sensibilidad 100%" 
      },
      { 
        question: "¿Incluye kit de instalación?", 
        answer: "Sí, incluye toallitas y guía de aplicación" 
      }
    ]
  },
  {
    title: "Funda Silicona Premium",
    price: 30000,
    stock: 40,
    category: "accesorios",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop",
    description: "Funda de silicona suave al tacto con protección completa",
    specs: {
      brand: "CasePro",
      color: "Varios colores disponibles",
      material: "Silicona líquida premium",
      compatibility: "Especificar modelo al comprar",
      warranty: "3 meses",
      features: [
        "Textura suave",
        "Bordes elevados",
        "Protección anti-golpes",
        "Acceso a todos los botones"
      ]
    },
    faqs: [
      { 
        question: "¿Se ensucia fácil?", 
        answer: "Es fácil de limpiar, repele polvo mejor que las fundas normales" 
      },
      { 
        question: "¿Tiene colores?", 
        answer: "Sí, disponible en negro, azul, rosa, y más" 
      }
    ]
  }
];

(async () => {
  await connectDB(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(REAL_PRODUCTS);
  console.log("Productos reales cargados exitosamente");
  process.exit(0);
})();