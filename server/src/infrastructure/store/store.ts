import { MenuItem, Order } from "../../domain/models";

const SEED_MENU: MenuItem[] = [
  { id: "1",  name: "Margherita Pizza",       description: "Classic San Marzano tomato, fresh mozzarella and basil on a hand-tossed crust",  price: 12.99, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80" },
  { id: "2",  name: "Classic Cheeseburger",   description: "Juicy 6oz beef patty, aged cheddar, lettuce, tomato and house sauce",            price: 9.99,  imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" },
  { id: "3",  name: "Caesar Salad",           description: "Crisp romaine, shaved parmesan, house-made croutons and classic Caesar dressing", price: 8.49,  imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80" },
  { id: "4",  name: "Spicy Chicken Wings",    description: "12 crispy wings tossed in our signature buffalo hot sauce with blue cheese dip",  price: 10.99, imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80" },
  { id: "5",  name: "Pasta Carbonara",        description: "Al dente spaghetti, guanciale, egg yolk, pecorino romano and black pepper",       price: 13.49, imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80" },
  { id: "6",  name: "Veggie Wrap",            description: "Grilled seasonal vegetables, hummus and feta in a toasted whole-wheat tortilla",   price: 7.99,  imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80" },
  { id: "7",  name: "BBQ Pulled Pork Tacos",  description: "Slow-smoked pulled pork, pickled slaw and chipotle mayo in corn tortillas",       price: 11.49, imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80" },
  { id: "8",  name: "Truffle Fries",          description: "Crispy shoestring fries tossed in truffle oil, parmesan and fresh herbs",         price: 6.99,  imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80" },
  { id: "9",  name: "Grilled Salmon",         description: "Atlantic salmon fillet, lemon butter sauce, asparagus and wild rice",             price: 18.99, imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80" },
  { id: "10", name: "Mushroom Risotto",       description: "Arborio rice, wild mushrooms, white wine, parmesan and fresh thyme",              price: 14.49, imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=80" },
  { id: "11", name: "Chicken Tikka Masala",   description: "Tender chicken in a rich, spiced tomato-cream sauce served with basmati rice",    price: 15.99, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80" },
  { id: "12", name: "Eggs Benedict",          description: "Toasted English muffin, Canadian bacon, poached eggs and hollandaise sauce",      price: 9.49,  imageUrl: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&q=80" },
  { id: "13", name: "Beef Ramen",             description: "Rich tonkotsu broth, braised beef, soft-boiled egg, nori and spring onion",       price: 14.99, imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80" },
  { id: "14", name: "Chocolate Lava Cake",    description: "Warm dark chocolate cake with a molten centre, served with vanilla ice cream",    price: 7.49,  imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80" },
  { id: "15", name: "Strawberry Smoothie",    description: "Fresh strawberries, banana, Greek yoghurt and honey blended with crushed ice",   price: 4.99,  imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80" },
  { id: "16", name: "Loaded Nachos",          description: "Tortilla chips, jalapeños, black beans, guacamole, sour cream and salsa",         price: 10.49, imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&q=80" },
];

let menuItems: MenuItem[] = [...SEED_MENU];
let orders: Map<string, Order> = new Map();

export function getMenuItems(): MenuItem[] {
  return menuItems;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}

export function getOrders(): Order[] {
  return Array.from(orders.values());
}

export function getOrderById(id: string): Order | undefined {
  return orders.get(id);
}

export function saveOrder(order: Order): Order {
  orders.set(order.id, order);
  return order;
}

export function updateOrder(order: Order): Order {
  orders.set(order.id, order);
  return order;
}

// For testing: reset store to initial state
export function _resetStore(): void {
  menuItems = [...SEED_MENU];
  orders = new Map();
}
