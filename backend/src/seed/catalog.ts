/**
 * Catalog of cuisines, cities and dish menus used by the dev seed.
 * Kept in one place so it's easy to tweak.
 */

export interface SeedCity {
  name: string;
  state: string;
  postalCode: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface SeedDishTemplate {
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isPopular?: boolean;
  tags?: string[];
}

export interface SeedCuisine {
  key: string;
  cuisines: string[];
  /** 10 distinct restaurant names per cuisine — one for each city slot. */
  names: string[];
  /** Rotating list of cover & banner images. */
  covers: string[];
  banners: string[];
  /** 8-12 dishes that make up the menu of every restaurant of this cuisine. */
  dishes: SeedDishTemplate[];
  /** Allowed price range buckets (1-4). */
  priceBuckets: Array<1 | 2 | 3 | 4>;
}

// ---------- Cities ----------
export const CITIES: SeedCity[] = [
  { name: "Pune", state: "Maharashtra", postalCode: "411001", coordinates: [73.8567, 18.5204] },
  { name: "Mumbai", state: "Maharashtra", postalCode: "400001", coordinates: [72.8777, 19.076] },
  { name: "Bengaluru", state: "Karnataka", postalCode: "560001", coordinates: [77.5946, 12.9716] },
  { name: "Delhi", state: "Delhi", postalCode: "110001", coordinates: [77.1025, 28.7041] },
  { name: "Chennai", state: "Tamil Nadu", postalCode: "600001", coordinates: [80.2707, 13.0827] },
  { name: "Hyderabad", state: "Telangana", postalCode: "500001", coordinates: [78.4867, 17.385] },
  { name: "Kolkata", state: "West Bengal", postalCode: "700001", coordinates: [88.3639, 22.5726] },
  { name: "Ahmedabad", state: "Gujarat", postalCode: "380001", coordinates: [72.5714, 23.0225] },
  { name: "Jaipur", state: "Rajasthan", postalCode: "302001", coordinates: [75.7873, 26.9124] },
  { name: "Goa", state: "Goa", postalCode: "403001", coordinates: [73.8278, 15.4989] },
];

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

// ---------- Cuisines ----------
export const CUISINES: SeedCuisine[] = [
  {
    key: "indian",
    cuisines: ["Indian", "North Indian", "Tandoor"],
    names: [
      "Royal Tandoor",
      "Spice Junction",
      "Maharaja Kitchen",
      "The Curry House",
      "Tandoori Nights",
      "Spice Route",
      "Royal Maharaja",
      "Tandoor Express",
      "Curry Leaf",
      "Saffron Kitchen",
    ],
    covers: [u("1585937421612-70a008356fbe"), u("1565557623262-b51c2513a641"), u("1603894584373-5ac82b2ae398")],
    banners: [u("1565557623262-b51c2513a641", 1600), u("1603894584373-5ac82b2ae398", 1600)],
    priceBuckets: [2, 2, 3, 2, 3],
    dishes: [
      { name: "Butter Chicken", description: "Tandoor-grilled chicken in a velvety tomato-butter gravy.", category: "Mains", price: 420, imageUrl: u("1603894584373-5ac82b2ae398", 500), isVeg: false, isPopular: true, tags: ["creamy", "chef-pick"] },
      { name: "Paneer Tikka", description: "Char-grilled cottage cheese skewers in yogurt marinade.", category: "Starters", price: 280, imageUrl: u("1601050690597-df0568f70950", 500), isVeg: true, isPopular: true, tags: ["spicy", "grill"] },
      { name: "Chicken Biryani", description: "Aromatic basmati rice layered with marinated chicken.", category: "Mains", price: 350, imageUrl: u("1563379091339-03b21ab4a4f8", 500), isVeg: false, isPopular: true, tags: ["signature"] },
      { name: "Dal Makhani", description: "Black lentils simmered overnight with butter and cream.", category: "Mains", price: 280, imageUrl: u("1546833999-b9f581a1996d", 500), isVeg: true, tags: ["creamy"] },
      { name: "Paneer Butter Masala", description: "Cottage cheese in a rich cashew-tomato gravy.", category: "Mains", price: 320, imageUrl: u("1631452180519-c014fe946bc7", 500), isVeg: true, tags: ["creamy"] },
      { name: "Tandoori Chicken (Half)", description: "Yogurt-marinated chicken from the clay oven.", category: "Starters", price: 380, isVeg: false },
      { name: "Garlic Naan", description: "Soft naan brushed with garlic butter.", category: "Breads", price: 80, isVeg: true, isPopular: true },
      { name: "Butter Roti", description: "Whole wheat flatbread with a smear of butter.", category: "Breads", price: 40, isVeg: true },
      { name: "Aloo Gobi", description: "Cauliflower and potatoes with tomato and spices.", category: "Mains", price: 220, isVeg: true },
      { name: "Gulab Jamun", description: "Warm milk dumplings in cardamom syrup.", category: "Desserts", price: 120, isVeg: true },
    ],
  },
  {
    key: "south-indian",
    cuisines: ["South Indian", "Indian"],
    names: [
      "South Stories",
      "Dosa Corner",
      "Madras Cafe",
      "Idli Spot",
      "Anna's Kitchen",
      "The Banana Leaf",
      "Filter Coffee Co.",
      "Sambhar House",
      "Krishna Bhavan",
      "Karnatika Mess",
    ],
    covers: [u("1668236543090-82eba5ee5976"), u("1668236543090-82eba5ee5976")],
    banners: [u("1631292784640-2b24be784d5d", 1600)],
    priceBuckets: [1, 1, 2, 1, 2],
    dishes: [
      { name: "Masala Dosa", description: "Crisp dosa with spiced potato filling.", category: "Dosa", price: 140, imageUrl: u("1668236543090-82eba5ee5976", 500), isVeg: true, isPopular: true },
      { name: "Rava Dosa", description: "Lacy semolina dosa served with chutneys.", category: "Dosa", price: 130, isVeg: true },
      { name: "Onion Uttapam", description: "Thick rice pancake with onions and chillies.", category: "Dosa", price: 160, isVeg: true },
      { name: "Idli (4 pcs)", description: "Steamed rice cakes with sambar.", category: "Tiffin", price: 100, isVeg: true, isPopular: true },
      { name: "Medu Vada", description: "Crispy lentil doughnuts with chutney.", category: "Tiffin", price: 80, isVeg: true },
      { name: "South Special Thali", description: "Sambar, rasam, 3 sabzis, rice, papad, payasam.", category: "Thalis", price: 240, isVeg: true, isPopular: true },
      { name: "Filter Coffee", description: "Frothy decoction coffee in a steel tumbler.", category: "Beverages", price: 60, isVeg: true },
      { name: "Pongal", description: "Comforting rice-lentil porridge with ghee.", category: "Tiffin", price: 150, isVeg: true },
    ],
  },
  {
    key: "chinese",
    cuisines: ["Chinese", "Indo-Chinese", "Asian"],
    names: [
      "Wok Express",
      "Dragon Palace",
      "Indo-Chinese Adda",
      "The Mandarin",
      "Beijing Bowl",
      "Hakka Heaven",
      "Sichuan House",
      "Wonton Co.",
      "Bamboo Garden",
      "Lotus Wok",
    ],
    covers: [u("1525755662778-989d0524087e"), u("1552611052-33e04de081de")],
    banners: [u("1525755662778-989d0524087e", 1600)],
    priceBuckets: [2, 2, 1, 2, 3],
    dishes: [
      { name: "Hakka Noodles", description: "Wok-tossed noodles with veggies & soy.", category: "Noodles", price: 200, imageUrl: u("1552611052-33e04de081de", 500), isVeg: true, isPopular: true },
      { name: "Schezwan Fried Rice", description: "Spicy rice with garlic, peppers and scallions.", category: "Rice", price: 220, isVeg: true },
      { name: "Chilli Chicken (Dry)", description: "Fried chicken tossed in chilli soy glaze.", category: "Starters", price: 280, imageUrl: u("1525755662778-989d0524087e", 500), isVeg: false, isPopular: true },
      { name: "Veg Manchurian", description: "Crisp veg balls in tangy garlic gravy.", category: "Starters", price: 240, isVeg: true },
      { name: "Spring Rolls (4 pcs)", description: "Crispy rolls stuffed with cabbage & carrots.", category: "Starters", price: 180, isVeg: true },
      { name: "Sweet & Sour Chicken", description: "Pineapple, peppers, tangy sauce.", category: "Mains", price: 320, isVeg: false },
      { name: "Honey Chilli Potato", description: "Crisp potatoes in honey-chilli glaze.", category: "Starters", price: 200, isVeg: true, isPopular: true },
      { name: "Dim Sum (Veg, 6 pcs)", description: "Steamed dumplings with chilli oil.", category: "Starters", price: 260, isVeg: true },
    ],
  },
  {
    key: "italian",
    cuisines: ["Italian", "Pizza", "Continental"],
    names: [
      "Pizza Palace",
      "Bella Italia",
      "Trattoria Roma",
      "The Pasta House",
      "Forno",
      "Nonna's Kitchen",
      "Pasta & Vino",
      "Olive Garden Café",
      "La Cucina",
      "Mama Mia",
    ],
    covers: [u("1513104890138-7c749659a591"), u("1574071318508-1cdbab80d002")],
    banners: [u("1574071318508-1cdbab80d002", 1600)],
    priceBuckets: [2, 3, 2, 3, 2],
    dishes: [
      { name: "Margherita Pizza", description: "San Marzano tomato, mozzarella, basil.", category: "Pizza", price: 340, imageUrl: u("1574071318508-1cdbab80d002", 500), isVeg: true, isPopular: true },
      { name: "Pepperoni Pizza", description: "Mozzarella, spiced pepperoni, oregano.", category: "Pizza", price: 480, imageUrl: u("1565299624946-b28f40a0ae38", 500), isVeg: false, isPopular: true },
      { name: "Quattro Formaggi", description: "Four-cheese pizza, no tomato.", category: "Pizza", price: 540, isVeg: true, tags: ["cheesy"] },
      { name: "Aglio e Olio", description: "Spaghetti with garlic, chilli, olive oil.", category: "Pasta", price: 320, isVeg: true },
      { name: "Penne Arrabbiata", description: "Spicy tomato sauce, chilli flakes.", category: "Pasta", price: 340, isVeg: true },
      { name: "Spaghetti Carbonara", description: "Egg, pancetta, parmesan, black pepper.", category: "Pasta", price: 380, isVeg: false, isPopular: true },
      { name: "Lasagna al Forno", description: "Layered pasta with meat ragù & béchamel.", category: "Pasta", price: 420, isVeg: false },
      { name: "Tiramisu", description: "Mascarpone, coffee, ladyfingers, cocoa.", category: "Desserts", price: 220, isVeg: true },
      { name: "Garlic Bread", description: "Toasted herb-garlic bread.", category: "Sides", price: 160, isVeg: true },
    ],
  },
  {
    key: "japanese",
    cuisines: ["Japanese", "Sushi", "Asian"],
    names: [
      "Sushi Spot",
      "Tokyo Bowl",
      "Sakura House",
      "Edo Sushi",
      "Ramen Bar",
      "Kyoto Kitchen",
      "Bento Box",
      "Hashi & Co.",
      "Umami Den",
      "Wasabi Lounge",
    ],
    covers: [u("1579871494447-9811cf80d66c"), u("1553621042-f6e147245754")],
    banners: [u("1553621042-f6e147245754", 1600)],
    priceBuckets: [3, 3, 4, 3, 3],
    dishes: [
      { name: "Salmon Avocado Roll", description: "Salmon, avocado, sushi rice, nori.", category: "Sushi", price: 480, imageUrl: u("1579871494447-9811cf80d66c", 500), isVeg: false, isPopular: true },
      { name: "Spicy Tuna Roll", description: "Tuna, sriracha mayo, cucumber.", category: "Sushi", price: 460, isVeg: false, isPopular: true },
      { name: "Veggie Dragon Roll", description: "Cucumber, avocado, mango.", category: "Sushi", price: 380, imageUrl: u("1617196034796-73dfa7b1fd56", 500), isVeg: true },
      { name: "Tonkotsu Ramen", description: "12-hour pork broth, ramen egg, chashu.", category: "Ramen", price: 520, imageUrl: u("1569718212165-3a8278d5f624", 500), isVeg: false, isPopular: true, tags: ["umami"] },
      { name: "Shoyu Ramen", description: "Soy-based broth, noodles, scallions.", category: "Ramen", price: 480, isVeg: false },
      { name: "Vegetable Tempura", description: "Crisp-fried seasonal veggies.", category: "Starters", price: 320, isVeg: true },
      { name: "Edamame", description: "Steamed soybeans with sea salt.", category: "Starters", price: 180, isVeg: true },
      { name: "Miso Soup", description: "Tofu, seaweed, scallions, dashi.", category: "Starters", price: 140, isVeg: true },
    ],
  },
  {
    key: "burger",
    cuisines: ["American", "Burgers", "Fast Food"],
    names: [
      "Smash & Burger",
      "The Patty Joint",
      "Big Bun Co.",
      "Flame Grill",
      "Burger Barn",
      "Stack House",
      "Charbroil Co.",
      "Drive Thru Diner",
      "Bun Inn",
      "Sizzle Stop",
    ],
    covers: [u("1568901346375-23c9450c58cd"), u("1550547660-d9450f859349")],
    banners: [u("1550547660-d9450f859349", 1600)],
    priceBuckets: [2, 2, 2, 3, 2],
    dishes: [
      { name: "Classic Smash Burger", description: "Double-smashed beef, cheese, pickles.", category: "Burgers", price: 280, imageUrl: u("1568901346375-23c9450c58cd", 500), isVeg: false, isPopular: true },
      { name: "Bacon Cheeseburger", description: "Beef patty, crispy bacon, cheddar.", category: "Burgers", price: 380, isVeg: false, isPopular: true },
      { name: "Mushroom Swiss Burger", description: "Sautéed mushrooms, swiss cheese.", category: "Burgers", price: 320, isVeg: true },
      { name: "Veggie Burger", description: "Chickpea patty, lettuce, sriracha mayo.", category: "Burgers", price: 240, isVeg: true },
      { name: "Buffalo Wings (8 pcs)", description: "Tangy buffalo sauce, blue cheese dip.", category: "Sides", price: 340, isVeg: false },
      { name: "Hand-cut Fries", description: "Triple-cooked with sea salt.", category: "Sides", price: 140, isVeg: true, isPopular: true },
      { name: "Onion Rings", description: "Beer-battered & crispy.", category: "Sides", price: 160, isVeg: true },
      { name: "Chocolate Milkshake", description: "Belgian chocolate, soft serve.", category: "Beverages", price: 220, isVeg: true },
    ],
  },
  {
    key: "cafe",
    cuisines: ["Café", "Continental", "Bakery"],
    names: [
      "Crumb & Co.",
      "Brews & Bites",
      "The Daily Grind",
      "Café Aroma",
      "Pearl Coffee Co.",
      "Sunday Cafe",
      "Toast & Roast",
      "Hearth Bakery",
      "Drip Coffee Bar",
      "Loaf & Latte",
    ],
    covers: [u("1495474472287-4d71bcdd2085"), u("1554118811-1e0d58224f24")],
    banners: [u("1554118811-1e0d58224f24", 1600)],
    priceBuckets: [2, 2, 3, 2, 2],
    dishes: [
      { name: "Cappuccino", description: "Espresso, steamed milk, foam art.", category: "Coffee", price: 180, isVeg: true, isPopular: true },
      { name: "Iced Latte", description: "Cold espresso with chilled milk over ice.", category: "Coffee", price: 220, isVeg: true },
      { name: "Avocado Toast", description: "Smashed avocado, chilli flakes, lemon.", category: "Brunch", price: 280, imageUrl: u("1546069901-ba9599a7e63c", 500), isVeg: true, isPopular: true },
      { name: "French Toast", description: "Cinnamon, vanilla, maple syrup.", category: "Brunch", price: 220, isVeg: true },
      { name: "Pancake Stack", description: "Three fluffy pancakes with butter.", category: "Brunch", price: 240, isVeg: true },
      { name: "Croissant", description: "Buttery, flaky French pastry.", category: "Bakery", price: 140, isVeg: true },
      { name: "Cheesecake Slice", description: "New York-style, fresh berries.", category: "Desserts", price: 280, isVeg: true, isPopular: true },
      { name: "Brownie", description: "Fudgy chocolate with walnuts.", category: "Desserts", price: 160, isVeg: true },
    ],
  },
  {
    key: "thai",
    cuisines: ["Thai", "Asian"],
    names: [
      "Bangkok Kitchen",
      "Thai Pavilion",
      "Lemongrass",
      "The Wok",
      "Siam House",
      "Kao Bowl",
      "Thai Smile",
      "Chao Phraya",
      "Green Mango",
      "Pad Thai Co.",
    ],
    covers: [u("1559847844-5315695dadae"), u("1559847844-5315695dadae")],
    banners: [u("1559847844-5315695dadae", 1600)],
    priceBuckets: [2, 3, 2, 3, 3],
    dishes: [
      { name: "Pad Thai", description: "Wok-fried rice noodles, tamarind, peanuts.", category: "Noodles", price: 320, isVeg: false, isPopular: true },
      { name: "Pad See Ew", description: "Wide rice noodles with soy & broccoli.", category: "Noodles", price: 300, isVeg: true },
      { name: "Green Thai Curry", description: "Coconut milk, green chillies, basil.", category: "Curries", price: 360, isVeg: true, isPopular: true },
      { name: "Red Thai Curry", description: "Spicy red curry with chicken & veggies.", category: "Curries", price: 380, isVeg: false },
      { name: "Tom Yum Soup", description: "Hot & sour soup with lemongrass.", category: "Soups", price: 260, isVeg: false },
      { name: "Thai Fried Rice", description: "Jasmine rice with eggs & soy.", category: "Rice", price: 280, isVeg: true },
      { name: "Mango Sticky Rice", description: "Sweet sticky rice with fresh mango.", category: "Desserts", price: 220, isVeg: true, isPopular: true },
      { name: "Satay Skewers (4 pcs)", description: "Grilled chicken with peanut sauce.", category: "Starters", price: 280, isVeg: false },
    ],
  },
  {
    key: "mexican",
    cuisines: ["Mexican", "Tex-Mex"],
    names: [
      "El Taco",
      "Burrito Bar",
      "Casa Verde",
      "Salsa & Lime",
      "Hacienda Kitchen",
      "Mariachi Tacos",
      "Pepper Co.",
      "Margarita House",
      "Guac & Roll",
      "Calle Mexicana",
    ],
    covers: [u("1551504734-5ee1c4a1479b"), u("1551504734-5ee1c4a1479b")],
    banners: [u("1551504734-5ee1c4a1479b", 1600)],
    priceBuckets: [2, 2, 3, 2, 3],
    dishes: [
      { name: "Beef Tacos (3 pcs)", description: "Soft tortillas, beef, salsa, lime.", category: "Tacos", price: 280, isVeg: false, isPopular: true },
      { name: "Veg Quesadilla", description: "Cheese & veggie stuffed grilled tortilla.", category: "Mains", price: 240, isVeg: true },
      { name: "Burrito Bowl", description: "Rice, beans, salsa, guacamole.", category: "Bowls", price: 320, isVeg: true, isPopular: true },
      { name: "Nachos Supreme", description: "Tortilla chips, cheese, jalapeños, salsa.", category: "Starters", price: 280, isVeg: true, isPopular: true },
      { name: "Chicken Fajitas", description: "Sizzling chicken, peppers, onions.", category: "Mains", price: 380, isVeg: false },
      { name: "Guacamole & Chips", description: "House guac with corn chips.", category: "Starters", price: 220, isVeg: true },
      { name: "Churros", description: "Cinnamon sugar, chocolate dip.", category: "Desserts", price: 180, isVeg: true },
    ],
  },
  {
    key: "biryani",
    cuisines: ["Biryani", "Hyderabadi", "Indian"],
    names: [
      "Biryani Adda",
      "Nawabi Dum",
      "Bawarchi House",
      "Dum Biryani Co.",
      "Hyderabadi Bayt",
      "Royal Dum",
      "Karim's Biryani",
      "Lazeez Biryani",
      "Awadhi Dum",
      "Paradise Biryani",
    ],
    covers: [u("1563379091339-03b21ab4a4f8"), u("1565557623262-b51c2513a641")],
    banners: [u("1563379091339-03b21ab4a4f8", 1600)],
    priceBuckets: [2, 2, 3, 2, 3],
    dishes: [
      { name: "Hyderabadi Chicken Dum Biryani", description: "Slow-cooked basmati with marinated chicken.", category: "Biryanis", price: 380, imageUrl: u("1563379091339-03b21ab4a4f8", 500), isVeg: false, isPopular: true },
      { name: "Mutton Biryani", description: "Tender mutton in fragrant basmati rice.", category: "Biryanis", price: 480, isVeg: false, isPopular: true },
      { name: "Veg Dum Biryani", description: "Mixed veggies layered with saffron rice.", category: "Biryanis", price: 280, isVeg: true },
      { name: "Mirchi Ka Salan", description: "Chillies in peanut-sesame gravy.", category: "Sides", price: 180, isVeg: true },
      { name: "Raita", description: "Curd, cucumber, cumin.", category: "Sides", price: 80, isVeg: true },
      { name: "Sheermal", description: "Saffron-laced sweet flatbread.", category: "Breads", price: 120, isVeg: true },
      { name: "Double Ka Meetha", description: "Bread pudding with reduced milk.", category: "Desserts", price: 160, isVeg: true },
    ],
  },
  {
    key: "healthy",
    cuisines: ["Healthy", "Salads", "Bowls"],
    names: [
      "Green Bowl",
      "Quinoa & Co.",
      "Leaf Café",
      "Bowl Story",
      "Fit Plate",
      "The Salad Spot",
      "Buddha Bowl",
      "Pure & Co.",
      "Toss & Bowl",
      "Crunch Café",
    ],
    covers: [u("1546069901-ba9599a7e63c"), u("1546069901-ba9599a7e63c")],
    banners: [u("1546069901-ba9599a7e63c", 1600)],
    priceBuckets: [2, 3, 3, 3, 2],
    dishes: [
      { name: "Quinoa Buddha Bowl", description: "Quinoa, roasted veg, tahini, seeds.", category: "Bowls", price: 320, imageUrl: u("1546069901-ba9599a7e63c", 500), isVeg: true, isPopular: true },
      { name: "Greek Salad", description: "Feta, olives, cucumber, tomatoes.", category: "Salads", price: 280, isVeg: true },
      { name: "Caesar Salad", description: "Romaine, parmesan, croutons, caesar dressing.", category: "Salads", price: 280, isVeg: true, isPopular: true },
      { name: "Acai Bowl", description: "Acai blend, granola, banana, berries.", category: "Bowls", price: 320, isVeg: true },
      { name: "Avocado Toast", description: "Sourdough, avocado, chilli flakes.", category: "Brunch", price: 280, isVeg: true, isPopular: true },
      { name: "Smoothie Bowl", description: "Berry blend, granola, coconut.", category: "Bowls", price: 280, isVeg: true },
      { name: "Cold-pressed Juice", description: "Beet-carrot-ginger or green apple.", category: "Beverages", price: 180, isVeg: true },
    ],
  },
  {
    key: "street-food",
    cuisines: ["Street Food", "Snacks", "Indian"],
    names: [
      "Chaat Hub",
      "Pav Junction",
      "Mumbai Tadka",
      "Chowpatty Express",
      "Sev Bhaji Co.",
      "Tikki & Tea",
      "Phuchka Garden",
      "Street Stop",
      "Galli Mughal",
      "Tapri Tales",
    ],
    covers: [u("1567620905732-2d1ec7ab7445"), u("1567620905732-2d1ec7ab7445")],
    banners: [u("1567620905732-2d1ec7ab7445", 1600)],
    priceBuckets: [1, 1, 1, 2, 1],
    dishes: [
      { name: "Vada Pav", description: "Mumbai's classic — spicy potato vada in bun.", category: "Snacks", price: 40, isVeg: true, isPopular: true },
      { name: "Pav Bhaji", description: "Spiced vegetable mash with buttered buns.", category: "Snacks", price: 140, isVeg: true, isPopular: true },
      { name: "Pani Puri (6 pcs)", description: "Crispy puris, spiced water, tamarind.", category: "Chaat", price: 80, isVeg: true, isPopular: true },
      { name: "Bhel Puri", description: "Puffed rice, sev, chutneys, onions.", category: "Chaat", price: 100, isVeg: true },
      { name: "Dahi Puri", description: "Puris with curd, sev, chutneys.", category: "Chaat", price: 120, isVeg: true },
      { name: "Samosa (2 pcs)", description: "Crispy pastry, spiced potato filling.", category: "Snacks", price: 60, isVeg: true },
      { name: "Aloo Tikki Chaat", description: "Potato patties with curd and chutneys.", category: "Chaat", price: 100, isVeg: true },
      { name: "Masala Chai", description: "Strong tea with milk, cardamom, ginger.", category: "Beverages", price: 30, isVeg: true },
    ],
  },
];
