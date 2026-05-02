interface Property {
  id: number;
  title: string;
  description: string;
  img: string;
  bedrooms: number;
  bathrooms: number;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
}

const propertyData: Property[] = [
  {
    id: 1,
    title: "Modern Loft in Palermo Soho",
    description:
      "A trendy loft in the heart of Palermo Soho, surrounded by the best boutiques and restaurants in the city. Features high ceilings and a private balcony.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 1,
    bathrooms: 1,
    price: 1200,
    address: "Thames 1234, Palermo, Buenos Aires",
    latitude: -34.5833,
    longitude: -58.4333,
  },
  {
    id: 2,
    title: "Elegant Apartment in Nueva Córdoba",
    description:
      "Spacious apartment perfect for students or young professionals. Located just steps away from Sarmiento Park and the university campus.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 2,
    bathrooms: 2,
    price: 900,
    address: "Estrada 456, Nueva Córdoba, Córdoba",
    latitude: -31.43,
    longitude: -64.188,
  },
  {
    id: 3,
    title: "Riverside View Studio in Pichincha",
    description:
      "Charming studio with an incredible view of the Paraná River. Modern finishes and located in the coolest neighborhood of Rosario.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 1,
    bathrooms: 1,
    price: 750,
    address: "Wheelwright 789, Pichincha, Rosario",
    latitude: -32.9333,
    longitude: -60.65,
  },
  {
    id: 4,
    title: "Luxury Villa in Chacras de Coria",
    description:
      "Experience the wine country in style. This luxury villa features a private vineyard, swimming pool, and breathtaking views of the Andes.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 4,
    bathrooms: 3,
    price: 2500,
    address: "Darragueira 101, Chacras de Coria, Mendoza",
    latitude: -32.99,
    longitude: -68.87,
  },
  {
    id: 5,
    title: "Lakeside Cabin in Bariloche",
    description:
      "Cozy wooden cabin with direct access to Lake Nahuel Huapi. Perfect for winter skiing or summer hiking adventures.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 3,
    bathrooms: 2,
    price: 1800,
    address: "Bustillo Km 7, Playa Bonita, Bariloche",
    latitude: -41.12,
    longitude: -71.4,
  },
  {
    id: 6,
    title: "Colonial House in San Lorenzo",
    description:
      "Traditional colonial-style home in the peaceful hills of San Lorenzo. Features a large garden and a clay oven for authentic empanadas.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 3,
    bathrooms: 2,
    price: 1100,
    address: "Calle de los Juncos 22, San Lorenzo, Salta",
    latitude: -24.73,
    longitude: -65.48,
  },
  {
    id: 7,
    title: "Classic Mansion in Los Troncos",
    description:
      "Exclusive residence in the most prestigious neighborhood of Mar del Plata. Elegant architecture with high-end details and a beautiful garden.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 5,
    bathrooms: 4,
    price: 3000,
    address: "Viamonte 2345, Los Troncos, Mar del Plata",
    latitude: -38.02,
    longitude: -57.54,
  },
  {
    id: 8,
    title: "Mountain Retreat in Ushuaia",
    description:
      "Cozy apartment at the end of the world. Enjoy stunning views of the Beagle Channel and easy access to the Martial Glacier.",
    img: "https://picsum.photos/1080/1920",
    bedrooms: 2,
    bathrooms: 1,
    price: 1400,
    address: "Camino del Glaciar 88, Ushuaia",
    latitude: -54.83,
    longitude: -68.35,
  },
];

export const singlePostData = {
  id: 1,
  title: "Modern Loft in Palermo Soho",
  description:
    "This stunning loft in Palermo Soho offers a unique living experience in one of Buenos Aires' most vibrant neighborhoods. The open-plan design features double-height ceilings, exposed brick walls, and large windows that flood the space with natural light. The kitchen is fully equipped with modern appliances, and the mezzanine bedroom provides a cozy retreat. Located just steps away from Plaza Serrano, you'll have the city's best cafes, bars, and designer shops right at your doorstep.",
  images: [
    "https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  ],
  price: 1200,
  bedRooms: 1,
  bathroom: 1,
  size: 861,
  city: "Buenos Aires",
  address: "Thames 1234, Palermo Soho",
  school: "400m away",
  bus: "200m away",
  restaurant: "50m away",
  latitude: -34.5833,
  longitude: -58.4333,
};

export const userData = {
  id: 1,
  name: "Johnathan Doebanne",
  img: "https://picsum.photos/1080/1920",
};

export default propertyData;
