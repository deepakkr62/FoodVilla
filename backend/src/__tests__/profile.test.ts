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
    name: "Aria",
    email: "aria@x.com",
    password: "secret123",
  });
  return res.body.accessToken as string;
}

describe("PATCH /api/users/me", () => {
  it("updates name, phone and avatarUrl", async () => {
    const token = await signIn();
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Aria Patel",
        phone: "+91 98765 43210",
        avatarUrl: "https://example.com/me.png",
      });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Aria Patel");
    expect(res.body.user.phone).toBe("+91 98765 43210");
    expect(res.body.user.avatarUrl).toBe("https://example.com/me.png");
  });

  it("treats empty string as 'clear this optional field'", async () => {
    const token = await signIn();
    await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "1234567890", avatarUrl: "https://example.com/x.png" });
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "", avatarUrl: "" });
    expect(res.status).toBe(200);
    expect(res.body.user.phone).toBeUndefined();
    expect(res.body.user.avatarUrl).toBeUndefined();
  });

  it("rejects too-short name (400)", async () => {
    const token = await signIn();
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A" });
    expect(res.status).toBe(400);
  });

  it("rejects invalid avatar URL (400)", async () => {
    const token = await signIn();
    const res = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ avatarUrl: "not-a-url" });
    expect(res.status).toBe(400);
  });

  it("requires authentication (401)", async () => {
    const res = await request(app).patch("/api/users/me").send({ name: "X" });
    expect(res.status).toBe(401);
  });
});
