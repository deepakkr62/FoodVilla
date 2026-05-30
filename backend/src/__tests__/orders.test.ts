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

async function makeCustomer(email = "c@x.com") {
  const r = await request(app).post("/api/auth/signup").send({
    name: "Cust",
    email,
    password: "secret123",
  });
  return { token: r.body.accessToken as string, userId: r.body.user.id as string };
}

async function makeOwnerWithRestaurantAndDishes(email = "o@x.com") {
  const signup = await request(app).post("/api/auth/signup").send({
    name: "Owner",
    email,
    password: "secret123",
    role: "restaurant_owner",
  });
  const token = signup.body.accessToken;
  const r = await request(app)
    .post("/api/owner/restaurant")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Test Kitchen",
      cuisines: ["Indian"],
      address: { line1: "1 St", city: "Pune", postalCode: "411001", country: "IN" },
      deliveryFee: 30,
      minOrder: 100,
    });
  const restaurantId = r.body.restaurant._id as string;
  const d1 = await request(app)
    .post("/api/owner/dishes")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Paneer Tikka", category: "Starters", price: 280, isVeg: true });
  const d2 = await request(app)
    .post("/api/owner/dishes")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Naan", category: "Breads", price: 60, isVeg: true });
  return {
    ownerToken: token as string,
    restaurantId,
    dishIds: [d1.body.dish._id as string, d2.body.dish._id as string],
  };
}

const sampleAddress = {
  label: "Home",
  line1: "12 Park Rd",
  city: "Pune",
  postalCode: "411001",
  country: "IN",
};

describe("Place order", () => {
  it("creates a COD order and computes pricing server-side", async () => {
    const { token } = await makeCustomer();
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [
          { dishId: dishIds[0], quantity: 2 }, // 280*2 = 560
          { dishId: dishIds[1], quantity: 1 }, //  60*1 = 60
        ],
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    expect(res.status).toBe(201);
    expect(res.body.order.pricing.subtotal).toBe(620);
    expect(res.body.order.pricing.taxes).toBe(31); // 5% of 620 = 31
    expect(res.body.order.pricing.deliveryFee).toBe(30);
    expect(res.body.order.pricing.total).toBe(681);
    expect(res.body.order.status).toBe("placed");
    expect(res.body.order.paymentMethod).toBe("cod");
    expect(res.body.checkoutUrl).toBeNull();
  });

  it("creates a card order and returns a checkout URL", async () => {
    const { token } = await makeCustomer();
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 1 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "card",
      });
    expect(res.status).toBe(201);
    expect(res.body.checkoutUrl).toContain("status=success");
    expect(res.body.order.stripeSessionId).toMatch(/^cs_test_fake_/);
  });

  it("rejects if subtotal is below restaurant minOrder", async () => {
    const { token } = await makeCustomer();
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[1], quantity: 1 }], // ₹60 < ₹100 min
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/minimum/i);
  });

  it("rejects orders for restaurant_owner role", async () => {
    const { ownerToken, restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 1 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    expect(res.status).toBe(403);
  });

  it("re-prices using DB values (client-tampered prices are ignored)", async () => {
    const { token } = await makeCustomer();
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 1, price: 1 }], // tampered price
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    expect(res.status).toBe(201);
    expect(res.body.order.items[0].price).toBe(280); // server's price wins
    expect(res.body.order.pricing.subtotal).toBe(280);
  });
});

describe("Order retrieval", () => {
  it("GET /api/orders — lists own orders", async () => {
    const { token } = await makeCustomer();
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 2 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBe(1);
  });

  it("GET /api/orders/:id — forbidden for another customer", async () => {
    const a = await makeCustomer("a@x.com");
    const b = await makeCustomer("b@x.com");
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${a.token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 2 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    const id = created.body.order._id;
    const res = await request(app)
      .get(`/api/orders/${id}`)
      .set("Authorization", `Bearer ${b.token}`);
    expect(res.status).toBe(403);
  });

  it("GET /api/owner/orders — lists incoming orders for the restaurant", async () => {
    const { token } = await makeCustomer();
    const { ownerToken, restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 2 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    const res = await request(app)
      .get("/api/owner/orders")
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.orders.length).toBe(1);
    expect(res.body.orders[0].pricing.total).toBeGreaterThan(0);
  });
});

describe("Owner order status updates", () => {
  async function placeFresh() {
    const { token } = await makeCustomer();
    const { ownerToken, restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 2 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "cod",
      });
    return { customerToken: token, ownerToken, orderId: created.body.order._id };
  }

  it("transitions placed → accepted → preparing → out_for_delivery → delivered", async () => {
    const { ownerToken, orderId } = await placeFresh();
    const next = async (status: string) =>
      request(app)
        .put(`/api/owner/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status });

    const states = ["accepted", "preparing", "out_for_delivery", "delivered"];
    for (const s of states) {
      const res = await next(s);
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe(s);
    }
  });

  it("rejects illegal transitions (e.g. placed → delivered)", async () => {
    const { ownerToken, orderId } = await placeFresh();
    const res = await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "delivered" });
    expect(res.status).toBe(400);
  });

  it("marks COD as paid when delivered", async () => {
    const { ownerToken, orderId } = await placeFresh();
    await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "accepted" });
    await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "preparing" });
    await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "out_for_delivery" });
    const res = await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "delivered" });
    expect(res.status).toBe(200);
    expect(res.body.order.paymentStatus).toBe("paid");
    expect(res.body.order.deliveredAt).toBeDefined();
  });

  it("forbids another owner from updating", async () => {
    const { orderId } = await placeFresh();
    const intruder = await request(app).post("/api/auth/signup").send({
      name: "Intruder",
      email: "intruder@x.com",
      password: "secret123",
      role: "restaurant_owner",
    });
    await request(app)
      .post("/api/owner/restaurant")
      .set("Authorization", `Bearer ${intruder.body.accessToken}`)
      .send({
        name: "Other",
        cuisines: ["Indian"],
        address: { line1: "1", city: "X", postalCode: "1", country: "IN" },
      });
    const res = await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${intruder.body.accessToken}`)
      .send({ status: "accepted" });
    expect(res.status).toBe(404);
  });
});

describe("Stripe session confirmation (dev fallback)", () => {
  it("marks order paid when confirming a fake session", async () => {
    const { token, userId } = await makeCustomer();
    const { restaurantId, dishIds } = await makeOwnerWithRestaurantAndDishes();
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        restaurantId,
        items: [{ dishId: dishIds[0], quantity: 1 }],
        deliveryAddress: sampleAddress,
        paymentMethod: "card",
      });
    const id = created.body.order._id;
    const res = await request(app)
      .post(`/api/orders/${id}/confirm?fake=1&session_id=cs_test_fake_${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.order.paymentStatus).toBe("paid");
    expect(res.body.order.status).toBe("accepted");
    expect(userId).toBeDefined();
  });
});
