/**
 * We don't spin up a real Socket.io server in tests — we mock the emit helpers
 * and assert the order controller calls them at the right moments.
 */
import request from "supertest";
import { clearTestDB, connectTestDB, disconnectTestDB } from "./testDb";

jest.mock("../services/socketService", () => ({
  initSocketServer: jest.fn(),
  getIO: jest.fn(() => null),
  emitNewOrder: jest.fn(),
  emitOrderUpdate: jest.fn(),
}));

import * as socketService from "../services/socketService";
import { createApp } from "../app";

const app = createApp();

beforeAll(async () => {
  await connectTestDB();
});
afterEach(async () => {
  jest.clearAllMocks();
  await clearTestDB();
});
afterAll(async () => {
  await disconnectTestDB();
});

async function makeCustomer() {
  const r = await request(app).post("/api/auth/signup").send({
    name: "Cust",
    email: "c@x.com",
    password: "secret123",
  });
  return r.body.accessToken as string;
}

async function makeOwnerWithSetup() {
  const o = await request(app).post("/api/auth/signup").send({
    name: "Owner",
    email: "o@x.com",
    password: "secret123",
    role: "restaurant_owner",
  });
  const token = o.body.accessToken;
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
  const d = await request(app)
    .post("/api/owner/dishes")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Paneer Tikka", price: 280 });
  return { ownerToken: token, restaurantId: r.body.restaurant._id, dishId: d.body.dish._id };
}

const address = { line1: "1 Park", city: "Pune", postalCode: "411001", country: "IN" };

describe("Socket emit triggers", () => {
  it("emits order:new on placeOrder", async () => {
    const cust = await makeCustomer();
    const { restaurantId, dishId } = await makeOwnerWithSetup();
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${cust}`)
      .send({
        restaurantId,
        items: [{ dishId, quantity: 1 }],
        deliveryAddress: address,
        paymentMethod: "cod",
      });
    expect(res.status).toBe(201);
    expect(socketService.emitNewOrder).toHaveBeenCalledTimes(1);
    expect(socketService.emitNewOrder).toHaveBeenCalledWith(
      restaurantId,
      expect.objectContaining({ status: "placed" }),
    );
  });

  it("emits order:updated on owner status change", async () => {
    const cust = await makeCustomer();
    const { ownerToken, restaurantId, dishId } = await makeOwnerWithSetup();
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${cust}`)
      .send({
        restaurantId,
        items: [{ dishId, quantity: 1 }],
        deliveryAddress: address,
        paymentMethod: "cod",
      });
    const orderId = created.body.order._id;
    (socketService.emitOrderUpdate as jest.Mock).mockClear();
    const res = await request(app)
      .put(`/api/owner/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ status: "accepted" });
    expect(res.status).toBe(200);
    expect(socketService.emitOrderUpdate).toHaveBeenCalledTimes(1);
    expect(socketService.emitOrderUpdate).toHaveBeenCalledWith(
      orderId,
      restaurantId,
      expect.objectContaining({ status: "accepted" }),
    );
  });

  it("emits order:updated when confirming a fake Stripe session", async () => {
    const cust = await makeCustomer();
    const { restaurantId, dishId } = await makeOwnerWithSetup();
    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${cust}`)
      .send({
        restaurantId,
        items: [{ dishId, quantity: 1 }],
        deliveryAddress: address,
        paymentMethod: "card",
      });
    const id = created.body.order._id;
    (socketService.emitOrderUpdate as jest.Mock).mockClear();
    await request(app)
      .post(`/api/orders/${id}/confirm?fake=1&session_id=cs_test_fake_${id}`)
      .set("Authorization", `Bearer ${cust}`);
    expect(socketService.emitOrderUpdate).toHaveBeenCalledTimes(1);
  });
});
