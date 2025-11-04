// Script para poblar la base de datos con productos reales de accesorios para celulares
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import { connectDB } from "../src/db.js";
import dotenv from "dotenv";

dotenv.config();

const productos = [
  // AUDÍFONOS
  {
    title: "Audífonos Inalámbricos AirPods Pro",
    price: 899000,
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=600&fit=crop",
    stock: 15,
    sku: "AUD-APP-001",
    description: "Audífonos inalámbricos con cancelación activa de ruido, modo transparencia y estuche de carga inalámbrica. Sonido envolvente espacial.",
    category: "audifonos",
    specs: {
      brand: "Apple",
      model: "AirPods Pro (2da Gen)",
      color: "Blanco",
      material: "Plástico premium",
      compatibility: "iPhone, iPad, Mac, dispositivos Android",
      warranty: "12 meses",
      features: [
        "Cancelación activa de ruido",
        "Modo transparencia",
        "Audio espacial personalizado",
        "Resistente al agua y sudor (IPX4)",
        "Hasta 6 horas de batería",
        "Estuche de carga inalámbrica MagSafe"
      ]
    },
    faqs: [
      {
        question: "¿Son compatibles con Android?",
        answer: "Sí, funcionan con cualquier dispositivo Bluetooth, aunque algunas funciones avanzadas están optimizadas para dispositivos Apple."
      },
      {
        question: "¿Cuánto dura la batería?",
        answer: "Hasta 6 horas de reproducción con una sola carga, y hasta 30 horas con el estuche de carga."
      },
      {
        question: "¿Resisten el agua?",
        answer: "Sí, tienen certificación IPX4, resistentes al agua y al sudor. Perfectos para entrenamientos."
      }
    ]
  },
  {
    title: "Audífonos Bluetooth JBL Tune 510BT",
    price: 149000,
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
    stock: 25,
    sku: "AUD-JBL-510",
    description: "Audífonos inalámbricos on-ear con sonido JBL Pure Bass, batería de larga duración y diseño plegable portátil.",
    category: "audifonos",
    specs: {
      brand: "JBL",
      model: "Tune 510BT",
      color: "Negro/Azul/Blanco",
      material: "Plástico y almohadillas de espuma",
      compatibility: "Universal - Bluetooth 5.0",
      warranty: "6 meses",
      features: [
        "Tecnología JBL Pure Bass",
        "Hasta 40 horas de batería",
        "Carga rápida - 5 min = 2 horas",
        "Diseño plegable",
        "Micrófono integrado",
        "Controles en los audífonos"
      ]
    },
    faqs: [
      {
        question: "¿Tienen cancelación de ruido?",
        answer: "No tienen cancelación activa de ruido, pero el diseño on-ear proporciona aislamiento pasivo del ruido ambiental."
      },
      {
        question: "¿Se pueden conectar a dos dispositivos a la vez?",
        answer: "No, pero puedes cambiar fácilmente entre dispositivos emparejados."
      }
    ]
  },
  {
    title: "Audífonos Samsung Galaxy Buds2 Pro",
    price: 649000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
    stock: 12,
    sku: "AUD-SAM-BP2",
    description: "Audífonos True Wireless con cancelación activa de ruido inteligente, audio de alta fidelidad de 24 bits y diseño ergonómico.",
    category: "audifonos",
    specs: {
      brand: "Samsung",
      model: "Galaxy Buds2 Pro",
      color: "Negro Grafito / Blanco / Violeta",
      material: "Plástico premium",
      compatibility: "Android, iOS, Windows",
      warranty: "12 meses",
      features: [
        "Cancelación activa inteligente de ruido",
        "Audio Hi-Fi de 24 bits",
        "Resistente al agua IPX7",
        "Hasta 5 horas de batería (ANC on)",
        "Estuche de carga inalámbrica",
        "Integración con Bixby y Google Assistant"
      ]
    },
    faqs: [
      {
        question: "¿Funcionan con iPhone?",
        answer: "Sí, son compatibles con iPhone y otros dispositivos iOS, aunque algunas funciones están optimizadas para dispositivos Samsung."
      },
      {
        question: "¿Puedo sumergirlos en agua?",
        answer: "Tienen certificación IPX7, lo que significa que resisten inmersión en agua hasta 1 metro por 30 minutos. Perfectos para entrenamientos intensos."
      }
    ]
  },

  // CARGADORES
  {
    title: "Cargador Rápido 20W USB-C Apple",
    price: 89000,
    image: "https://images.unsplash.com/photo-1591290619762-99aa4b43c597?w=600&h=600&fit=crop",
    stock: 30,
    sku: "CAR-APP-20W",
    description: "Adaptador de corriente USB-C de 20W con tecnología de carga rápida para iPhone, iPad y otros dispositivos compatibles.",
    category: "cargadores",
    specs: {
      brand: "Apple",
      model: "20W USB-C Power Adapter",
      color: "Blanco",
      material: "Plástico PC de alta resistencia",
      compatibility: "iPhone 8 o posterior, iPad, AirPods",
      warranty: "12 meses",
      features: [
        "Carga rápida 20W",
        "Puerto USB-C",
        "Diseño compacto",
        "Protección contra sobrecarga",
        "Certificado por Apple",
        "Compatible con cable USB-C a Lightning"
      ]
    },
    faqs: [
      {
        question: "¿Incluye el cable?",
        answer: "No, el cable se vende por separado. Necesitas un cable USB-C a Lightning para cargar tu iPhone."
      },
      {
        question: "¿Cuánto más rápido carga que un cargador normal?",
        answer: "Puede cargar hasta 50% de batería en aproximadamente 30 minutos en modelos compatibles, hasta 3 veces más rápido que un cargador de 5W."
      }
    ]
  },
  {
    title: "Cargador Inalámbrico Samsung 15W",
    price: 129000,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=600&fit=crop",
    stock: 20,
    sku: "CAR-SAM-15W",
    description: "Cargador inalámbrico de carga rápida con ventilador de refrigeración integrado, compatible con todos los dispositivos Qi.",
    category: "cargadores",
    specs: {
      brand: "Samsung",
      model: "Wireless Charger Pad 15W",
      color: "Negro",
      material: "Aluminio y vidrio templado",
      compatibility: "Cualquier dispositivo con carga Qi (Samsung, iPhone, etc)",
      warranty: "12 meses",
      features: [
        "Carga rápida hasta 15W",
        "Ventilador de refrigeración",
        "Indicador LED",
        "Protección contra sobrecalentamiento",
        "Detección de objetos extraños",
        "Puede cargar con funda (hasta 3mm)"
      ]
    },
    faqs: [
      {
        question: "¿Funciona con iPhone?",
        answer: "Sí, es compatible con todos los iPhone con carga inalámbrica (iPhone 8 y posteriores), aunque cargará a 7.5W según las especificaciones de Apple."
      },
      {
        question: "¿Necesito quitar la funda del celular?",
        answer: "No es necesario si tu funda tiene menos de 3mm de grosor y no tiene accesorios metálicos."
      }
    ]
  },
  {
    title: "Power Bank 20000mAh Carga Rápida",
    price: 119000,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop",
    stock: 18,
    sku: "CAR-PB-20K",
    description: "Batería externa de alta capacidad con carga rápida 22.5W, display digital y múltiples puertos para cargar varios dispositivos simultáneamente.",
    category: "cargadores",
    specs: {
      brand: "Anker",
      model: "PowerCore 20000mAh",
      color: "Negro",
      material: "Aluminio",
      compatibility: "Universal - todos los smartphones y tablets",
      warranty: "18 meses",
      features: [
        "Capacidad 20000mAh",
        "Carga rápida 22.5W (PD y QC3.0)",
        "3 puertos (2 USB-A + 1 USB-C)",
        "Display digital de batería",
        "Carga simultánea de 3 dispositivos",
        "Protección inteligente múltiple"
      ]
    },
    faqs: [
      {
        question: "¿Cuántas veces puede cargar un iPhone?",
        answer: "Puede cargar un iPhone 13 aproximadamente 4-5 veces completas, dependiendo del uso durante la carga."
      },
      {
        question: "¿Cuánto tiempo tarda en cargarse completamente?",
        answer: "Con un cargador de 18W o superior, tarda aproximadamente 6-7 horas en cargarse completamente."
      },
      {
        question: "¿Puedo llevarlo en el avión?",
        answer: "Sí, cumple con las regulaciones de la TSA/IATA para viajes aéreos (menos de 100Wh)."
      }
    ]
  },

  // CABLES
  {
    title: "Cable USB-C a Lightning 1m Apple Original",
    price: 69000,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&h=600&fit=crop",
    stock: 35,
    sku: "CAB-APP-CL1",
    description: "Cable oficial de Apple USB-C a Lightning para carga rápida y sincronización de datos. Certificado MFi.",
    category: "cables",
    specs: {
      brand: "Apple",
      model: "USB-C to Lightning Cable",
      color: "Blanco",
      material: "TPE de alta resistencia",
      compatibility: "iPhone 5 o posterior, iPad, iPod",
      warranty: "12 meses",
      features: [
        "Certificado MFi de Apple",
        "Soporte para carga rápida",
        "Transferencia de datos USB 2.0",
        "Longitud 1 metro",
        "Conectores reforzados",
        "Compatible con todos los accesorios Lightning"
      ]
    },
    faqs: [
      {
        question: "¿Es original de Apple?",
        answer: "Sí, es 100% original de Apple con certificación MFi y viene en empaque sellado."
      },
      {
        question: "¿Soporta carga rápida?",
        answer: "Sí, combinado con un adaptador de 20W o superior, permite carga rápida en modelos compatibles."
      }
    ]
  },
  {
    title: "Cable USB-C a USB-C 2m Trenzado",
    price: 45000,
    image: "https://images.unsplash.com/photo-1625281456425-4c0611df56a1?w=600&h=600&fit=crop",
    stock: 40,
    sku: "CAB-USC-2M",
    description: "Cable USB-C trenzado de nylon resistente, soporta carga rápida hasta 100W y transferencia de datos a alta velocidad.",
    category: "cables",
    specs: {
      brand: "Ugreen",
      model: "USB-C to USB-C Braided Cable",
      color: "Negro / Gris",
      material: "Nylon trenzado",
      compatibility: "Todos los dispositivos USB-C (Samsung, MacBook, iPad Pro, etc)",
      warranty: "24 meses",
      features: [
        "Carga rápida hasta 100W (PD 3.0)",
        "Transferencia de datos 480Mbps",
        "Trenzado de nylon resistente",
        "Longitud 2 metros",
        "Conectores de aluminio",
        "Soporta hasta 10,000 flexiones"
      ]
    },
    faqs: [
      {
        question: "¿Sirve para cargar laptops?",
        answer: "Sí, soporta hasta 100W, suficiente para cargar la mayoría de laptops USB-C como MacBook Pro, Dell XPS, etc."
      },
      {
        question: "¿Qué lo hace más resistente que los cables normales?",
        answer: "El trenzado de nylon militar y los conectores reforzados de aluminio lo hacen hasta 10 veces más resistente que cables plásticos normales."
      }
    ]
  },

  // PROTECTORES
  {
    title: "Protector de Pantalla Vidrio Templado iPhone 14",
    price: 35000,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
    stock: 50,
    sku: "PROT-IP14-VT",
    description: "Vidrio templado 9H ultra resistente con tecnología anti-huella y fácil instalación sin burbujas. Incluye kit de instalación.",
    category: "protectores",
    specs: {
      brand: "Spigen",
      model: "Tempered Glass Screen Protector",
      color: "Transparente",
      material: "Vidrio templado 9H",
      compatibility: "iPhone 14 / 14 Pro",
      warranty: "6 meses",
      features: [
        "Dureza 9H anti-rayones",
        "Tecnología oleofóbica anti-huellas",
        "Grosor 0.33mm",
        "Transparencia 99.9%",
        "Bordes redondeados 2.5D",
        "Kit de instalación incluido"
      ]
    },
    faqs: [
      {
        question: "¿Afecta la sensibilidad táctil?",
        answer: "No, el grosor de 0.33mm mantiene la sensibilidad táctil original de la pantalla."
      },
      {
        question: "¿Cubre toda la pantalla?",
        answer: "Sí, cubre toda el área visible de la pantalla sin interferir con las fundas."
      },
      {
        question: "¿Qué pasa si se quiebra?",
        answer: "El protector absorbe el impacto protegiend la pantalla real. Puedes reemplazarlo fácilmente con uno nuevo."
      }
    ]
  },
  {
    title: "Funda Silicona Líquida con MagSafe iPhone 14 Pro",
    price: 89000,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=600&fit=crop",
    stock: 28,
    sku: "FUND-IP14P-SL",
    description: "Funda premium de silicona líquida con interior de microfibra, compatible con MagSafe y protección de bordes elevados.",
    category: "protectores",
    specs: {
      brand: "Apple",
      model: "Silicone Case with MagSafe",
      color: "Medianoche / Rosa / Azul / Blanco",
      material: "Silicona líquida de alta calidad",
      compatibility: "iPhone 14 Pro",
      warranty: "12 meses",
      features: [
        "Compatible con MagSafe",
        "Interior de microfibra",
        "Bordes elevados protegen cámara",
        "Botones de aluminio integrados",
        "Tacto suave premium",
        "Fácil de limpiar"
      ]
    },
    faqs: [
      {
        question: "¿Qué es MagSafe?",
        answer: "Es un sistema de imanes integrados que permite acoplar accesorios como cargadores inalámbricos y carteras de forma magnética."
      },
      {
        question: "¿Protege si se cae el teléfono?",
        answer: "Sí, los bordes elevados protegen la pantalla y la cámara al caer. La silicona absorbe impactos moderados."
      }
    ]
  },

  // MEMORIAS
  {
    title: "Memoria USB-C 128GB SanDisk Ultra Dual Drive",
    price: 79000,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop",
    stock: 22,
    sku: "MEM-SD-128",
    description: "Memoria flash dual con conectores USB-C y USB-A para transferir archivos entre teléfonos, tablets y computadoras.",
    category: "accesorios",
    specs: {
      brand: "SanDisk",
      model: "Ultra Dual Drive Luxe USB-C",
      color: "Plateado",
      material: "Metal",
      compatibility: "Dispositivos USB-C y USB-A",
      warranty: "60 meses (5 años)",
      features: [
        "Capacidad 128GB",
        "Doble conector (USB-C + USB-A)",
        "Velocidad lectura hasta 150MB/s",
        "Diseño giratorio 360°",
        "Carcasa metálica resistente",
        "App SanDisk Memory Zone"
      ]
    },
    faqs: [
      {
        question: "¿Funciona con mi teléfono Android?",
        answer: "Sí, funciona con cualquier dispositivo que tenga puerto USB-C, incluyendo smartphones Android modernos."
      },
      {
        question: "¿Puedo ver películas directamente desde la memoria?",
        answer: "Sí, puedes reproducir contenido multimedia directamente sin necesidad de copiar al dispositivo."
      }
    ]
  },

  // SOPORTES Y ACCESORIOS
  {
    title: "Soporte Magnético para Auto con MagSafe",
    price: 65000,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=600&fit=crop",
    stock: 15,
    sku: "SOP-MAG-AUTO",
    description: "Soporte magnético ultra fuerte para auto con rotación 360°, compatible con MagSafe y todos los teléfonos con anillo magnético.",
    category: "accesorios",
    specs: {
      brand: "Belkin",
      model: "MagSafe Car Vent Mount",
      color: "Negro",
      material: "ABS y aluminio",
      compatibility: "iPhone 12 o posterior, Android con anillo MagSafe",
      warranty: "24 meses",
      features: [
        "Imanes ultra fuertes",
        "Rotación 360° y ajuste de ángulo",
        "Se monta en las rejillas de ventilación",
        "No interfiere con MagSafe",
        "Instalación sin herramientas",
        "Diseño compacto y elegante"
      ]
    },
    faqs: [
      {
        question: "¿Funciona con funda?",
        answer: "Sí, funciona con fundas compatibles con MagSafe. Para otras fundas, puedes usar un anillo adhesivo MagSafe."
      },
      {
        question: "¿Es seguro? ¿No se caerá en los baches?",
        answer: "Los imanes son muy fuertes y mantienen el teléfono seguro incluso en caminos irregulares. Ha sido probado rigurosamente."
      }
    ]
  },

  {
    title: "Limpiador UV-C Esterilizador para Celulares",
    price: 149000,
    image: "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=600&h=600&fit=crop",
    stock: 10,
    sku: "LIM-UVC-001",
    description: "Caja esterilizadora UV-C que elimina el 99.9% de gérmenes y bacterias de tu celular en solo 5 minutos. Incluye carga inalámbrica.",
    category: "accesorios",
    specs: {
      brand: "PhoneSoap",
      model: "UV Sanitizer & Wireless Charger",
      color: "Blanco",
      material: "Plástico ABS antibacterial",
      compatibility: "Todos los smartphones hasta 6.9 pulgadas",
      warranty: "12 meses",
      features: [
        "Luz UV-C germicida",
        "Elimina 99.9% de gérmenes",
        "Ciclo de limpieza de 5 minutos",
        "Carga inalámbrica integrada 10W",
        "Desinfecta otros objetos pequeños",
        "Apagado automático"
      ]
    },
    faqs: [
      {
        question: "¿Es seguro para mi celular?",
        answer: "Sí, la luz UV-C no daña la pantalla ni los componentes del teléfono. Es el mismo tipo de luz usada en hospitales."
      },
      {
        question: "¿Realmente elimina gérmenes?",
        answer: "Sí, estudios científicos demuestran que la luz UV-C elimina el 99.9% de bacterias y virus en superficies."
      },
      {
        question: "¿Puedo desinfectar otros objetos?",
        answer: "Sí, puedes desinfectar llaves, relojes, audífonos, mascarillas y otros objetos pequeños que quepan en la caja."
      }
    ]
  }
];

async function seed() {
  try {
    console.log("🔌 Conectando a MongoDB...");
    await connectDB(process.env.MONGODB_URI);
    
    console.log("🗑️  Eliminando productos existentes...");
    await Product.deleteMany({});
    
    console.log("📦 Insertando nuevos productos...");
    const insertedProducts = await Product.insertMany(productos);
    
    console.log(`✅ Se insertaron ${insertedProducts.length} productos exitosamente!`);
    console.log("\n📊 Resumen por categoría:");
    
    const categoryCounts = productos.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} productos`);
    });
    
    console.log("\n💰 Valor total del inventario:", 
      productos.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString("es-CO")
    );
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seed();
