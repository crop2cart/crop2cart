export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];
  description: string;
  inStock: boolean;
  category: string;
}

export const fruits: Product[] = [
  {
    id: 1,
    name: "Red Apples",
    price: 45,
    originalPrice: 65,
    images: [
      "https://img.freepik.com/premium-photo/close-up-red-apples-with-water-drops_20411-3158.jpg?w=500",
      "https://img.freepik.com/premium-photo/red-apples-wooden-surface_23286-1069.jpg?w=500",
    ],
    description: "Crisp and juicy red apples freshly picked from local farms. Rich in fiber and vitamin C.",
    inStock: true,
    category: "Apples",
  },
  {
    id: 2,
    name: "Bananas (1 Kg)",
    price: 35,
    originalPrice: 50,
    images: [
      "https://img.freepik.com/premium-photo/bunch-fresh-yellow-bananas-white-background_85220-2195.jpg?w=500",
      "https://img.freepik.com/premium-photo/fresh-bananas-isolated-white-background_185193-1152.jpg?w=500",
    ],
    description: "Fresh yellow bananas rich in potassium and natural sugars. Perfect for energy boost.",
    inStock: true,
    category: "Bananas",
  },
  {
    id: 3,
    name: "Strawberries (500g)",
    price: 120,
    originalPrice: 180,
    images: [
      "https://img.freepik.com/premium-photo/fresh-strawberries-white-background_85220-2200.jpg?w=500",
      "https://img.freepik.com/premium-photo/ripe-strawberries-wooden-basket_85220-2205.jpg?w=500",
    ],
    description: "Sweet and fresh strawberries from organic farms. Hand-picked and delivered within 24 hours.",
    inStock: true,
    category: "Berries",
  },
  {
    id: 4,
    name: "Oranges (1 Kg)",
    price: 55,
    originalPrice: 80,
    images: [
      "https://img.freepik.com/premium-photo/fresh-oranges-white-background_85220-2210.jpg?w=500",
      "https://img.freepik.com/premium-photo/orange-juice-fresh-oranges_85220-2215.jpg?w=500",
    ],
    description: "Juicy and sweet oranges rich in Vitamin C. Perfect for fresh juice or as a snack.",
    inStock: true,
    category: "Citrus",
  },
  {
    id: 5,
    name: "Grapes (500g)",
    price: 95,
    originalPrice: 140,
    images: [
      "https://img.freepik.com/premium-photo/fresh-black-grapes-white-background_85220-2220.jpg?w=500",
      "https://img.freepik.com/premium-photo/bunch-grapes-isolated_85220-2225.jpg?w=500",
    ],
    description: "Premium black grapes, sweet and seedless. Grown without pesticides.",
    inStock: true,
    category: "Grapes",
  },
  {
    id: 6,
    name: "Watermelon (1 Pc)",
    price: 180,
    originalPrice: 260,
    images: [
      "https://img.freepik.com/premium-photo/fresh-watermelon-slice-white-background_85220-2230.jpg?w=500",
      "https://img.freepik.com/premium-photo/whole-watermelon-isolated-white_85220-2235.jpg?w=500",
    ],
    description: "Sweet and refreshing watermelon perfect for summers. 100% fresh and juicy.",
    inStock: true,
    category: "Melons",
  },
  {
    id: 7,
    name: "Mangoes (1 Kg)",
    price: 120,
    originalPrice: 180,
    images: [
      "https://img.freepik.com/premium-photo/fresh-ripe-mangoes-white-background_85220-2240.jpg?w=500",
      "https://img.freepik.com/premium-photo/mango-fruit-isolated_85220-2245.jpg?w=500",
    ],
    description: "King of fruits - fresh Alphonso mangoes from local farmers. Sweet and aromatic.",
    inStock: true,
    category: "Tropical",
  },
  {
    id: 8,
    name: "Pineapple (1 Pc)",
    price: 85,
    originalPrice: 130,
    images: [
      "https://img.freepik.com/premium-photo/fresh-pineapple-white-background_85220-2250.jpg?w=500",
      "https://img.freepik.com/premium-photo/pineapple-slice-isolated_85220-2255.jpg?w=500",
    ],
    description: "Tropical pineapple rich in bromelain enzyme. Great for digestion.",
    inStock: true,
    category: "Tropical",
  },
  {
    id: 9,
    name: "Guava (1 Kg)",
    price: 65,
    originalPrice: 100,
    images: [
      "https://img.freepik.com/premium-photo/fresh-guava-white-background_85220-2260.jpg?w=500",
      "https://img.freepik.com/premium-photo/guava-fruit-halved_85220-2265.jpg?w=500",
    ],
    description: "Fresh and healthy guava full of vitamins. Naturally sweet.",
    inStock: true,
    category: "Tropical",
  },
  {
    id: 10,
    name: "Pomegranate (1 Kg)",
    price: 150,
    originalPrice: 220,
    images: [
      "https://img.freepik.com/premium-photo/fresh-pomegranate-white-background_85220-2270.jpg?w=500",
      "https://img.freepik.com/premium-photo/pomegranate-seeds-halved-fruit_85220-2275.jpg?w=500",
    ],
    description: "Ruby red pomegranate packed with antioxidants. Supports heart health.",
    inStock: true,
    category: "Exotic",
  },
  {
    id: 11,
    name: "Papaya (1 Pc)",
    price: 75,
    originalPrice: 120,
    images: [
      "https://img.freepik.com/premium-photo/fresh-papaya-white-background_85220-2280.jpg?w=500",
      "https://img.freepik.com/premium-photo/papaya-sliced-halved_85220-2285.jpg?w=500",
    ],
    description: "Sweet orange papaya rich in enzymes. Perfect for tropical smoothies.",
    inStock: false,
    category: "Tropical",
  },
  {
    id: 12,
    name: "Blueberries (500g)",
    price: 180,
    originalPrice: 280,
    images: [
      "https://img.freepik.com/premium-photo/fresh-blueberries-white-background_85220-2290.jpg?w=500",
      "https://img.freepik.com/premium-photo/blueberries-wooden-bowl_85220-2295.jpg?w=500",
    ],
    description: "Antioxidant rich blueberries imported fresh. Superfood for health.",
    inStock: true,
    category: "Berries",
  },
  {
    id: 13,
    name: "Kiwi (500g)",
    price: 110,
    originalPrice: 170,
    images: [
      "https://img.freepik.com/premium-photo/fresh-kiwi-white-background_85220-2300.jpg?w=500",
      "https://img.freepik.com/premium-photo/kiwi-fruit-sliced_85220-2305.jpg?w=500",
    ],
    description: "Tangy and sweet kiwi full of enzymes. Helps with digestion.",
    inStock: true,
    category: "Exotic",
  },
  {
    id: 14,
    name: "Dragon Fruit (1 Pc)",
    price: 140,
    originalPrice: 220,
    images: [
      "https://img.freepik.com/premium-photo/fresh-dragon-fruit-white-background_85220-2310.jpg?w=500",
      "https://img.freepik.com/premium-photo/dragon-fruit-sliced_85220-2315.jpg?w=500",
    ],
    description: "Exotic dragon fruit loaded with Vitamin C. Low in calories.",
    inStock: true,
    category: "Exotic",
  },
  {
    id: 15,
    name: "Peaches (500g)",
    price: 100,
    originalPrice: 160,
    images: [
      "https://img.freepik.com/premium-photo/fresh-peaches-white-background_85220-2320.jpg?w=500",
      "https://img.freepik.com/premium-photo/peaches-halved-pit_85220-2325.jpg?w=500",
    ],
    description: "Soft and juicy peaches from premium orchards. Sweet and delicious.",
    inStock: true,
    category: "Stone Fruits",
  },
];
