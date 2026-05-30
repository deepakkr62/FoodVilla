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

const baseUser = {
  name: "Aria Patel",
  email: "aria@example.com",
  password: "secret123",
};

describe("POST /api/auth/signup", () => {
  it("creates a customer by default and returns access token", async () => {
    const res = await request(app).post("/api/auth/signup").send(baseUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("aria@example.com");
    expect(res.body.user.role).toBe("customer");
    expect(res.body.user.password).toBeUndefined();
    expect(typeof res.body.accessToken).toBe("string");
    const cookie = res.headers["set-cookie"];
    expect(Array.isArray(cookie) ? cookie.join(";") : cookie).toContain(
      "foodvilla_refresh=",
    );
  });

  it("supports restaurant_owner role on signup", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...baseUser, role: "restaurant_owner" });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("restaurant_owner");
  });

  it("rejects duplicate emails with 409", async () => {
    await request(app).post("/api/auth/signup").send(baseUser);
    const res = await request(app).post("/api/auth/signup").send(baseUser);
    expect(res.status).toBe(409);
  });

  it("rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...baseUser, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...baseUser, password: "short" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/signup").send(baseUser);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: baseUser.email, password: baseUser.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(baseUser.email);
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: baseUser.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "secret123" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me (protected)", () => {
  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns user with valid token", async () => {
    const signup = await request(app).post("/api/auth/signup").send(baseUser);
    const token = signup.body.accessToken;
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(baseUser.email);
  });

  it("returns 401 with malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not.a.valid.jwt");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/refresh", () => {
  it("returns new access token using refresh cookie", async () => {
    const signupRes = await request(app).post("/api/auth/signup").send(baseUser);
    const cookies = signupRes.headers["set-cookie"];
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", Array.isArray(cookies) ? cookies : [cookies]);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("returns 401 without refresh cookie", async () => {
    const res = await request(app).post("/api/auth/refresh");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the refresh cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(200);
    const setCookie = res.headers["set-cookie"];
    const joined = Array.isArray(setCookie) ? setCookie.join(";") : String(setCookie);
    expect(joined).toMatch(/foodvilla_refresh=;/);
  });
});
