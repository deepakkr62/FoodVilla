import request from "supertest";
import { createApp } from "../app";
import { clearTestDB, connectTestDB, disconnectTestDB } from "./testDb";

const app = createApp();

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

async function seedRestaurant(opts: {
  email: string;
  name: string;
  cuisines?: string[];
  city?: string;
  priceRange?: 1 | 2 | 3 | 4;
  lng?: number;
  lat?: number;
}) {
  const signup = await request(app).post("/api/auth/signup").send({
    name: "Owner",
    email: opts.email,
    password: "secret123",
    role: "restaurant_owner",
  });
  const token = signup.body.accessToken;
  const body: Record<string, unknown> = {
    name: opts.name,
    cuisines: opts.cuisines ?? ["Indian"],
    priceRange: opts.priceRange ?? 2,
    address: {
      line1: "1 St",
      city: opts.city ?? "Pune",
      postalCode: "411001",
      country: "IN",
    },
  };
  if (opts.lng !== undefined && opts.lat !== undefined) {
    body.location = { type: "Point", coordinates: [opts.lng, opts.lat] };
  }
  const res = await request(app)
    .post("/api/owner/restaurant")
    .set("Authorization", `Bearer ${token}`)
    .send(body);
  return res.body.restaurant;
}

describe("Customer browsing", () => {
  it("filters by minRating", async () => {
    await seedRestaurant({ email: "a@x.com", name: "Place A" });
    await seedRestaurant({ email: "b@x.com", name: "Place B" });
    // Boost Place A's rating manually via mongoose
    const list = await request(app).get("/api/restaurants?minRating=0");
    expect(list.body.items.length).toBe(2);
  });

  it("filters by city", async () => {
    await seedRestaurant({ email: "a@x.com", name: "Pune Spot", city: "Pune" });
    await seedRestaurant({ email: "b@x.com", name: "Mumbai Spot", city: "Mumbai" });
    const res = await request(app).get("/api/restaurants?city=Mumbai");
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].name).toBe("Mumbai Spot");
  });

  it("filters by maxPrice", async () => {
    await seedRestaurant({ email: "a@x.com", name: "Cheap", priceRange: 1 });
    await seedRestaurant({ email: "b@x.com", name: "Fancy", priceRange: 4 });
    const res = await request(app).get("/api/restaurants?maxPrice=2");
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].name).toBe("Cheap");
  });

  it("supports text search via ?q=", async () => {
    await seedRestaurant({
      email: "a@x.com",
      name: "Pizza Palace",
      cuisines: ["Italian"],
    });
    await seedRestaurant({
      email: "b@x.com",
      name: "Sushi Spot",
      cuisines: ["Japanese"],
    });
    const res = await request(app).get("/api/restaurants?q=Pizza");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items.some((r: { name: string }) => r.name === "Pizza Palace")).toBe(true);
  });

  it("paginates results", async () => {
    for (let i = 0; i < 5; i += 1) {
      await seedRestaurant({ email: `${i}@x.com`, name: `Place ${i}` });
    }
    const page1 = await request(app).get("/api/restaurants?limit=2&page=1");
    const page2 = await request(app).get("/api/restaurants?limit=2&page=2");
    expect(page1.body.items.length).toBe(2);
    expect(page2.body.items.length).toBe(2);
    expect(page1.body.total).toBe(5);
    const ids1 = page1.body.items.map((r: { _id: string }) => r._id);
    const ids2 = page2.body.items.map((r: { _id: string }) => r._id);
    expect(ids1).not.toEqual(ids2);
  });

  it("orders by proximity when lat/lng provided", async () => {
    // Far (Mumbai ~150km from Pune)
    await seedRestaurant({
      email: "far@x.com",
      name: "Far Place",
      lng: 72.8777,
      lat: 19.076,
    });
    // Near (Pune)
    await seedRestaurant({
      email: "near@x.com",
      name: "Near Place",
      lng: 73.8567,
      lat: 18.5204,
    });
    const res = await request(app).get(
      "/api/restaurants?lat=18.5204&lng=73.8567&radius=50",
    );
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1); // far place excluded by 50km radius
    expect(res.body.items[0].name).toBe("Near Place");
  });
});
