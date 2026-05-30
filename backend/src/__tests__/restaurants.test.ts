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

async function makeOwner(email = "owner@example.com") {
  const res = await request(app).post("/api/auth/signup").send({
    name: "Owner One",
    email,
    password: "secret123",
    role: "restaurant_owner",
  });
  return { token: res.body.accessToken as string, user: res.body.user };
}

async function makeCustomer(email = "cust@example.com") {
  const res = await request(app).post("/api/auth/signup").send({
    name: "Customer",
    email,
    password: "secret123",
  });
  return { token: res.body.accessToken as string, user: res.body.user };
}

const validRestaurant = {
  name: "Spice Villa",
  description: "Authentic Indian comfort food",
  cuisines: ["Indian", "Tandoor"],
  priceRange: 2,
  address: { line1: "12 Park Rd", city: "Pune", postalCode: "411001", country: "IN" },
  deliveryFee: 30,
  minOrder: 100,
  prepTimeMinutes: 25,
};

describe("Restaurant owner CRUD", () => {
  it("POST /api/owner/restaurant — creates a restaurant for the owner", async () => {
    const { token } = await makeOwner();
    const res = await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    expect(res.status).toBe(201);
    expect(res.body.restaurant.name).toBe("Spice Villa");
    expect(res.body.restaurant.slug).toBe("spice-villa");
    expect(res.body.restaurant.owner).toBeDefined();
  });

  it("rejects creation by a customer (403)", async () => {
    const { token } = await makeCustomer();
    const res = await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    expect(res.status).toBe(403);
  });

  it("rejects creation without auth (401)", async () => {
    const res = await request(app).post("/api/owner/restaurant").send(validRestaurant);
    expect(res.status).toBe(401);
  });

  it("enforces one restaurant per owner (409)", async () => {
    const { token } = await makeOwner();
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    const res = await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    expect(res.status).toBe(409);
  });

  it("generates unique slugs for duplicate names across owners", async () => {
    const a = await makeOwner("a@x.com");
    const b = await makeOwner("b@x.com");
    const r1 = await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${a.token}`)
      .send(validRestaurant);
    const r2 = await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${b.token}`)
      .send(validRestaurant);
    expect(r1.body.restaurant.slug).toBe("spice-villa");
    expect(r2.body.restaurant.slug).toBe("spice-villa-2");
  });

  it("PUT /api/owner/restaurant — updates the owner's restaurant", async () => {
    const { token } = await makeOwner();
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    const res = await request(app)
      .put("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Spice Villa Premium", deliveryFee: 40 });
    expect(res.status).toBe(200);
    expect(res.body.restaurant.name).toBe("Spice Villa Premium");
    expect(res.body.restaurant.slug).toBe("spice-villa-premium");
    expect(res.body.restaurant.deliveryFee).toBe(40);
  });

  it("GET /api/owner/restaurant — returns null if none yet", async () => {
    const { token } = await makeOwner();
    const res = await request(app)
      .get("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.restaurant).toBeNull();
  });
});

describe("Public restaurant endpoints", () => {
  it("GET /api/restaurants — lists restaurants", async () => {
    const { token } = await makeOwner();
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    const res = await request(app).get("/api/restaurants");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBe(1);
  });

  it("GET /api/restaurants/:slug — returns details with dishes", async () => {
    const { token } = await makeOwner();
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${token}`)
      .send(validRestaurant);
    const res = await request(app).get("/api/restaurants/spice-villa");
    expect(res.status).toBe(200);
    expect(res.body.restaurant.name).toBe("Spice Villa");
    expect(Array.isArray(res.body.dishes)).toBe(true);
  });

  it("filters by cuisine", async () => {
    const a = await makeOwner("a@x.com");
    const b = await makeOwner("b@x.com");
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${a.token}`)
      .send({ ...validRestaurant, cuisines: ["Indian"] });
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${b.token}`)
      .send({ ...validRestaurant, name: "Sushi Spot", cuisines: ["Japanese"] });
    const res = await request(app).get("/api/restaurants?cuisine=Japanese");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].name).toBe("Sushi Spot");
  });
});
