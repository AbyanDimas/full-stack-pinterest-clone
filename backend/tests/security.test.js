import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret_security";
  process.env.CLIENT_URL = "http://localhost:5173";
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("API Security Tests", () => {
  it("should have security headers (Helmet)", async () => {
    const res = await request(app).get("/pins");

    expect(res.headers["x-dns-prefetch-control"]).toBe("off");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["x-download-options"]).toBe("noopen");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-xss-protection"]).toBe("0");
  });

  it("should prevent unauthorized access to protected routes", async () => {
    const res = await request(app)
      .post("/pins/interact/12345")
      .send({ type: "like" });

    // verifyToken middleware should block this
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Not authenticated!");
  });

  it("should fail gracefully on invalid NoSQL injection payloads in auth", async () => {
    // Attempting a basic NoSQL injection payload
    const res = await request(app)
      .post("/users/auth/login")
      .send({
        email: { $gt: "" },
        password: "password123",
      });

    expect(res.statusCode).toBe(401);
  });
});
