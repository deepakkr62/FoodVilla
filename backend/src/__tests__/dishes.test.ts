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

async function ownerWithRestaurant(email = "o@x.com") {
  const signup = await request(app).post("/api/auth/signup").send({
    name: "Owner",
    email,
    password: "secret123",
    role: "restaurant_owner",
  });
  const token = signup.body.accessToken;
  await request(app)
    .post("/api/owner/restaurant")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Test Kitchen",
      cuisines: ["Indian"],
      address: { line1: "1 St", city: "Pune", postalCode: "411001", country: "IN" },
    });
  return token as string;
}

const sampleDish = {
  name: "Paneer Tikka",
  description: "Char-grilled cottage cheese skewers",
  category: "Starters",
  price: 280,
  isVeg: true,
  tags: ["spicy", "grill"],
};

describe("Owner dish CRUD", () => {
  it("POST /api/owner/dishes — creates a dish", async () => {
    const token = await ownerWithRestaurant();
    const res = await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleDish);
    expect(res.status).toBe(201);
    expect(res.body.dish.name).toBe("Paneer Tikka");
    expect(res.body.dish.restaurant).toBeDefined();
  });

  it("rejects dish creation when owner has no restaurant", async () => {
    const signup = await request(app).post("/api/auth/signup").send({
      name: "Owner",
      email: "noresto@x.com",
      password: "secret123",
      role: "restaurant_owner",
    });
    const res = await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${signup.body.accessToken}`)
      .send(sampleDish);
    expect(res.status).toBe(404);
  });

  it("rejects negative price", async () => {
    const token = await ownerWithRestaurant();
    const res = await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...sampleDish, price: -10 });
    expect(res.status).toBe(400);
  });

  it("PUT /api/owner/dishes/:id — updates own dish", async () => {
    const token = await ownerWithRestaurant();
    const created = await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleDish);
    const id = created.body.dish._id;
    const res = await request(app)
      .put(`/api/owner/dishes/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 320, isPopular: true });
    expect(res.status).toBe(200);
    expect(res.body.dish.price).toBe(320);
    expect(res.body.dish.isPopular).toBe(true);
  });

  it("forbids updating another owner's dish (404 since scoped to owner)", async () => {
    const tokenA = await ownerWithRestaurant("a@x.com");
    const tokenB = await ownerWithRestaurant("b@x.com");
    const created = await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(sampleDish);
    const id = created.body.dish._id;
    const res = await request(app)
      .put(`/api/owner/dishes/${id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ price: 999 });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/owner/dishes/:id — deletes own dish", async () => {
    const token = await ownerWithRestaurant();
    const created = await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleDish);
    const id = created.body.dish._id;
    const res = await request(app)
      .delete(`/api/owner/dishes/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    const list = await request(app)
      .get("/api/owner/dishes")
      .set("Authorization", `Bearer ${token}`);
    expect(list.body.dishes.length).toBe(0);
  });

  it("GET /api/owner/dishes — lists only your dishes", async () => {
    const tokenA = await ownerWithRestaurant("a@x.com");
    const tokenB = await ownerWithRestaurant("b@x.com");
    await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(sampleDish);
    await request(app)
      .post("/api/owner/dishes")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ ...sampleDish, name: "Sushi Roll" });
    const aList = await request(app)
      .get("/api/owner/dishes")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(aList.body.dishes.length).toBe(1);
    expect(aList.body.dishes[0].name).toBe("Paneer Tikka");
  });
});
