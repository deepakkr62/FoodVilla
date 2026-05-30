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

const address = { line1: "12 Park Rd", city: "Pune", postalCode: "411001", country: "IN" };

async function setupSeed() {
  // Owner + restaurant + 1 dish
  const own = await request(app).post("/api/auth/signup").send({
    name: "Owner",
    email: "o@x.com",
    password: "secret123",
    role: "restaurant_owner",
  });
  const ownerToken = own.body.accessToken;
  const r = await request(app)
    .post("/api/owner/restaurant")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      name: "Test Kitchen",
      cuisines: ["Indian"],
      address,
      deliveryFee: 0,
      minOrder: 0,
    });
  const restaurantId = r.body.restaurant._id;
  const d = await request(app)
    .post("/api/owner/dishes")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ name: "Paneer Tikka", price: 200 });
  return { ownerToken, restaurantId, dishId: d.body.dish._id, slug: r.body.restaurant.slug };
}

async function placeAndDeliver(opts: { ownerToken: string; restaurantId: string; dishId: string }) {
  const cust = await request(app).post("/api/auth/signup").send({
    name: "Cust",
    email: `cust-${Math.random()}@x.com`,
    password: "secret123",
  });
  const token = cust.body.accessToken;
  const placed = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      restaurantId: opts.restaurantId,
      items: [{ dishId: opts.dishId, quantity: 1 }],
      deliveryAddress: address,
      paymentMethod: "cod",
    });
  const orderId = placed.body.order._id;
  // Walk it through the state machine
  for (const s of ["accepted", "preparing", "out_for_delivery", "delivered"]) {
    await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${opts.ownerToken}`)
      .send({ status: s });
  }
  return { token, orderId };
}

describe("Reviews", () => {
  it("POST /api/reviews — creates a review for a delivered order", async () => {
    const seed = await setupSeed();
    const { token, orderId } = await placeAndDeliver(seed);
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId, rating: 5, comment: "Loved it!" });
    expect(res.status).toBe(201);
    expect(res.body.review.rating).toBe(5);
    expect(res.body.review.comment).toBe("Loved it!");
  });

  it("rejects reviews for undelivered orders (400)", async () => {
    const seed = await setupSeed();
    const cust = await request(app).post("/api/auth/signup").send({
      name: "Cust",
      email: "c@x.com",
      password: "secret123",
    });
    const token = cust.body.accessToken;
    const placed = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId: seed.restaurantId,
        items: [{ dishId: seed.dishId, quantity: 1 }],
        deliveryAddress: address,
        paymentMethod: "cod",
      });
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId: placed.body.order._id, rating: 4 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/delivered/i);
  });

  it("rejects reviewing the same order twice (409)", async () => {
    const seed = await setupSeed();
    const { token, orderId } = await placeAndDeliver(seed);
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId, rating: 4 });
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId, rating: 2 });
    expect(res.status).toBe(409);
  });

  it("rejects reviews by another customer (403)", async () => {
    const seed = await setupSeed();
    const { orderId } = await placeAndDeliver(seed);
    const intruder = await request(app).post("/api/auth/signup").send({
      name: "Intruder",
      email: "intruder@x.com",
      password: "secret123",
    });
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${intruder.body.accessToken}`)
      .send({ orderId, rating: 1 });
    expect(res.status).toBe(403);
  });

  it("rejects out-of-range rating (400)", async () => {
    const seed = await setupSeed();
    const { token, orderId } = await placeAndDeliver(seed);
    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId, rating: 6 });
    expect(res.status).toBe(400);
  });

  it("recalculates restaurant rating after each review", async () => {
    const seed = await setupSeed();
    const r1 = await placeAndDeliver(seed);
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${r1.token}`)
      .send({ orderId: r1.orderId, rating: 4 });

    let detail = await request(app).get(`/api/restaurants/${seed.slug}`);
    expect(detail.body.restaurant.rating.average).toBe(4);
    expect(detail.body.restaurant.rating.count).toBe(1);

    const r2 = await placeAndDeliver(seed);
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${r2.token}`)
      .send({ orderId: r2.orderId, rating: 2 });

    detail = await request(app).get(`/api/restaurants/${seed.slug}`);
    expect(detail.body.restaurant.rating.average).toBe(3);
    expect(detail.body.restaurant.rating.count).toBe(2);

    const r3 = await placeAndDeliver(seed);
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${r3.token}`)
      .send({ orderId: r3.orderId, rating: 5 });

    detail = await request(app).get(`/api/restaurants/${seed.slug}`);
    // (4 + 2 + 5) / 3 = 3.6...7 → rounded to 3.7
    expect(detail.body.restaurant.rating.average).toBe(3.7);
    expect(detail.body.restaurant.rating.count).toBe(3);
  });

  it("GET /api/restaurants/:slug/reviews — returns paginated reviews", async () => {
    const seed = await setupSeed();
    const r1 = await placeAndDeliver(seed);
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${r1.token}`)
      .send({ orderId: r1.orderId, rating: 5, comment: "Amazing" });
    const res = await request(app).get(`/api/restaurants/${seed.slug}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.reviews.length).toBe(1);
    expect(res.body.total).toBe(1);
    expect(res.body.reviews[0].customer.name).toBeDefined();
    expect(res.body.rating.average).toBe(5);
  });

  it("GET /api/orders/:id/review — returns review for the customer's own order", async () => {
    const seed = await setupSeed();
    const { token, orderId } = await placeAndDeliver(seed);
    let res = await request(app)
      .get(`/api/orders/${orderId}/review`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.review).toBeNull();
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId, rating: 4 });
    res = await request(app)
      .get(`/api/orders/${orderId}/review`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.body.review.rating).toBe(4);
  });
});
