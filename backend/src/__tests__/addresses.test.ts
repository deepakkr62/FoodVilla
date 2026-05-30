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

async function signIn() {
  const res = await request(app).post("/api/auth/signup").send({
    name: "Customer",
    email: "c@x.com",
    password: "secret123",
  });
  return res.body.accessToken as string;
}

const sample = {
  label: "Home",
  line1: "12 Park Rd",
  city: "Pune",
  postalCode: "411001",
  country: "IN",
};

describe("Address CRUD", () => {
  it("GET /api/users/me/addresses — empty by default", async () => {
    const token = await signIn();
    const res = await request(app)
      .get("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.addresses).toEqual([]);
  });

  it("POST creates an address; first one becomes default", async () => {
    const token = await signIn();
    const res = await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(201);
    expect(res.body.addresses.length).toBe(1);
    expect(res.body.addresses[0].isDefault).toBe(true);
  });

  it("POST a second address with isDefault=true demotes the first", async () => {
    const token = await signIn();
    await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    const res = await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...sample, label: "Office", isDefault: true });
    expect(res.status).toBe(201);
    const defaults = res.body.addresses.filter((a: { isDefault: boolean }) => a.isDefault);
    expect(defaults.length).toBe(1);
    expect(defaults[0].label).toBe("Office");
  });

  it("PUT updates an address", async () => {
    const token = await signIn();
    const created = await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    const id = created.body.addresses[0]._id;
    const res = await request(app)
      .put(`/api/users/me/addresses/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ label: "Home2", line1: "99 New Rd" });
    expect(res.status).toBe(200);
    const updated = res.body.addresses.find((a: { _id: string }) => a._id === id);
    expect(updated.label).toBe("Home2");
    expect(updated.line1).toBe("99 New Rd");
  });

  it("DELETE removes an address and promotes another default", async () => {
    const token = await signIn();
    const a = await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send(sample);
    await request(app)
      .post("/api/users/me/addresses")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...sample, label: "Office" });
    const defaultId = a.body.addresses[0]._id;
    const res = await request(app)
      .delete(`/api/users/me/addresses/${defaultId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.addresses.length).toBe(1);
    expect(res.body.addresses[0].isDefault).toBe(true);
  });

  it("requires authentication (401)", async () => {
    const res = await request(app).get("/api/users/me/addresses");
    expect(res.status).toBe(401);
  });
});
