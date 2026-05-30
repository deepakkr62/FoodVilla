import request from "supertest";
import { createApp } from "../app";

describe("Health endpoint", () => {
  const app = createApp();

  it("GET /api/health returns 200 and ok status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("foodvilla-api");
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /api/unknown returns 404", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not Found");
  });

  it("GET / returns service info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.service).toBe("Food Villa API");
  });
});
