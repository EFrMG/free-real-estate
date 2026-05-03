interface PropertyData {
  id: number;
  userId?: number;
  type: "buy" | "rent";
  title: string;
  description: string;
  longDescription?: string;
  img: string;
  imageGallery?: string[];
  sizes?: number[];
  bedrooms: number;
  bathrooms: number;
  price: number;
  province: string;
  city: string;
  address: string;
  nearbyPlaces?: Record<string, `${number}m`>;
  latitude: number;
  longitude: number;
}

interface UserData {
  id: number;
  name: string;
  img: string;
}

export const propertyData: PropertyData[] = [
  {
    id: 1,
    userId: 1,
    type: "rent",
    title: "Modern Loft in Palermo Soho",
    description:
      "A trendy loft in the heart of Palermo Soho, surrounded by the best boutiques and restaurants in the city. Features high ceilings and a private balcony.",
    longDescription:
      "This stunning loft in Palermo Soho offers a unique living experience in one of Buenos Aires' most vibrant neighborhoods. The open-plan design features double-height ceilings, exposed brick walls, and large windows that flood the space with natural light. The kitchen is fully equipped with modern appliances, and the mezzanine bedroom provides a cozy retreat. Located just steps away from Plaza Serrano, you'll have the city's best cafes, bars, and designer shops right at your doorstep.",
    img: "https://picsum.photos/1080/1920",
    imageGallery: [
      "https://picsum.photos/1080/1920",
      "https://picsum.photos/1080/1920",
      "https://picsum.photos/1080/1920",
    ],
    sizes: [831, 605],
    bedrooms: 1,
    bathrooms: 1,
    price: 1200,
    province: "Buenos Aires",
    city: "Buenos Aires (capital)",
    address: "Thames 1234, Palermo, Buenos Aires",
    nearbyPlaces: {
      school: "400m",
      bus: "200m",
      restaurant: "50m",
    },
    latitude: -34.5833,
    longitude: -58.4333,
  },
  {
    id: 2,
    type: "rent",
    title: "Elegant Apartment in Nueva Córdoba",
    description:
      "Spacious apartment perfect for students or young professionals. Located just steps away from Sarmiento Park and the university campus.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 2,
    bathrooms: 2,
    price: 900,
    province: "Córdoba",
    city: "Córdoba (capital)",
    address: "Estrada 456, Nueva Córdoba",
    latitude: -31.43,
    longitude: -64.188,
  },
  {
    id: 3,
    title: "Riverside View Studio",
    type: "rent",
    description:
      "Charming studio with an incredible view of the Paraná River. Modern finishes and located in the coolest neighborhood of Rosario.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 1,
    bathrooms: 1,
    price: 750,
    province: "Rosario",
    city: "Pichincha",
    address: "Wheelwright 789",
    latitude: -32.9333,
    longitude: -60.65,
  },
  {
    id: 4,
    type: "rent",
    title: "Luxury Villa in Chacras de Coria",
    description:
      "Experience the wine country in style. This luxury villa features a private vineyard, swimming pool, and breathtaking views of the Andes.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 4,
    bathrooms: 3,
    price: 2500,
    province: "Mendoza",
    city: "Chacras de Coria",
    address: "Darragueira 101",
    latitude: -32.99,
    longitude: -68.87,
  },
  {
    id: 5,
    type: "rent",
    title: "Lakeside Cabin in Bariloche",
    description:
      "Cozy wooden cabin with direct access to Lake Nahuel Huapi. Perfect for winter skiing or summer hiking adventures.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 3,
    bathrooms: 2,
    price: 1800,
    province: "Rio Negro",
    city: "San Carlos de Bariloche",
    address: "Bustillo Km 7, Playa Bonita",
    latitude: -41.12,
    longitude: -71.4,
  },
  {
    id: 6,
    type: "rent",
    title: "Colonial House in San Lorenzo",
    description:
      "Traditional colonial-style home in the peaceful hills of San Lorenzo. Features a large garden and a clay oven for authentic empanadas.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 3,
    bathrooms: 2,
    price: 1100,
    province: "Salta",
    city: "San Lorenzo",
    address: "Calle de los Juncos 22",
    latitude: -24.73,
    longitude: -65.48,
  },
  {
    id: 7,
    type: "rent",
    title: "Classic Mansion in Los Troncos",
    description:
      "Exclusive residence in the most prestigious neighborhood of Mar del Plata. Elegant architecture with high-end details and a beautiful garden.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 5,
    bathrooms: 4,
    price: 3000,
    province: "Buenos Aires",
    city: "Mar del Plata",
    address: "Viamonte 2345, Los Troncos",
    latitude: -38.02,
    longitude: -57.54,
  },
  {
    id: 8,
    type: "rent",
    title: "Southern Mountain Retreat",
    description:
      "Cozy apartment at the end of the world. Enjoy stunning views of the Beagle Channel and easy access to the Martial Glacier.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 2,
    bathrooms: 1,
    price: 1400,
    province: "Tierra del Fuego",
    city: "Ushuaia",
    address: "Camino del Glaciar 88",
    latitude: -54.83,
    longitude: -68.35,
  },
];

export const userData: UserData[] = [
  {
    id: 1,
    name: "Johnathan Doebanne",
    img: "https://picsum.photos/1080/1920",
  },
];
