/**
 * Dev seed — populates a fresh database with ~120 procedurally generated
 * restaurants (12 cuisines × 10 cities). Idempotent: re-running only adds
 * the slugs that don't already exist, so it's safe to invoke on every boot.
 */
import { Dish } from "./models/Dish";
import { Restaurant, slugify } from "./models/Restaurant";
import { User } from "./models/User";
import { CITIES, CUISINES, type SeedCity, type SeedCuisine, type SeedDishTemplate } from "./seed/catalog";

const PASSWORD = "demo1234";

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function jitter(base: number, spread: number, i: number): number {
  // Deterministic pseudo-random — produces stable values for the same index.
  const r = Math.abs(Math.sin(i * 9301 + 49297) * 233280);
  const frac = r - Math.floor(r);
  return Math.round(base + (frac - 0.5) * spread);
}

interface PlannedRestaurant {
  name: string;
  slug: string;
  city: SeedCity;
  cuisine: SeedCuisine;
  index: number;
}

function planRestaurants(): PlannedRestaurant[] {
  const planned: PlannedRestaurant[] = [];
  let i = 0;
  for (const cuisine of CUISINES) {
    CITIES.forEach((city, cityIdx) => {
      const baseName = pick(cuisine.names, cityIdx);
      const styles = [
        baseName,
        `${baseName} — ${city.name}`,
        `${baseName} ${city.name}`,
        `${city.name} ${baseName}`,
      ];
      const name = styles[i % styles.length];
      planned.push({
        name,
        slug: slugify(name) || `restaurant-${i}`,
        city,
        cuisine,
        index: i,
      });
      i += 1;
    });
  }
  return planned;
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let suffix = 1;
  while (await Restaurant.findOne({ slug: candidate }).lean()) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

async function seedOne(planned: PlannedRestaurant): Promise<boolean> {
  const { name, slug, city, cuisine, index } = planned;

  if (await Restaurant.findOne({ slug }).lean()) return false;

  const ownerEmail = `${slug}@demo.local`;
  let owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    owner = await User.create({
      name: `${name} Owner`,
      email: ownerEmail,
      password: PASSWORD,
      role: "restaurant_owner",
    });
  }
  if (await Restaurant.findOne({ owner: owner._id }).lean()) return false;

  const priceRange = pick(cuisine.priceBuckets, index);
  const deliveryFee = jitter(40, 50, index);
  const minOrder = jitter(180, 200, index + 7);
  const prepTimeMinutes = jitter(28, 18, index + 13);
  const ratingAvg = Math.min(
    4.9,
    Math.max(3.5, 3.5 + ((Math.abs(Math.sin(index * 17.13)) * 100) % 14) / 10),
  );
  const ratingCount = jitter(180, 350, index + 21);

  const finalSlug = await uniqueSlug(slug);

  const restaurant = await Restaurant.create({
    owner: owner._id,
    name,
    slug: finalSlug,
    description: `${cuisine.cuisines[0]} comfort food in the heart of ${city.name}. Curated chef-driven menu, fresh ingredients, hot and fast.`,
    cuisines: cuisine.cuisines,
    priceRange,
    address: {
      line1: `${jitter(50, 90, index + 1)} Main Road`,
      city: city.name,
      state: city.state,
      postalCode: city.postalCode,
      country: "IN",
    },
    location: { type: "Point", coordinates: city.coordinates },
    coverImageUrl: pick(cuisine.covers, index),
    bannerImageUrl: pick(cuisine.banners, index),
    rating: { average: Math.round(ratingAvg * 10) / 10, count: Math.max(5, ratingCount) },
    deliveryFee: Math.max(15, deliveryFee),
    minOrder: Math.max(80, minOrder),
    prepTimeMinutes: Math.max(15, prepTimeMinutes),
    isOpen: true,
    isApproved: true,
  });

  const dishDocs = cuisine.dishes.map((d: SeedDishTemplate, di: number) => ({
    restaurant: restaurant._id,
    name: d.name,
    description: d.description,
    category: d.category,
    price: Math.max(20, d.price + jitter(0, 40, index * 17 + di)),
    imageUrl: d.imageUrl,
    isVeg: d.isVeg,
    isPopular: !!d.isPopular,
    tags: d.tags ?? [],
    isAvailable: true,
  }));
  await Dish.insertMany(dishDocs);
  return true;
}

export async function seedDevData() {
  const customerEmail = "customer@demo.local";
  if (!(await User.findOne({ email: customerEmail }))) {
    await User.create({
      name: "Demo Customer",
      email: customerEmail,
      password: PASSWORD,
      role: "customer",
    });
  }

  const totalBefore = await Restaurant.countDocuments();
  if (totalBefore >= 100) {
    return { seeded: false, restaurantCount: totalBefore };
  }

  const planned = planRestaurants();
  let added = 0;
  for (const p of planned) {
    if (await seedOne(p)) added += 1;
  }
  const totalAfter = await Restaurant.countDocuments();
  return { seeded: added > 0, restaurantCount: totalAfter };
}
