import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  process.env.CLIENT_URL = "http://localhost:5173";
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe("Pinterest API Complex Tests", () => {
  it("should create a user, log in, and fail to create a pin without media", async () => {
    // 1. Register a user
    const userRes = await request(app).post("/users/auth/register").send({
      username: "testuser",
      email: "test@test.com",
      password: "password123",
      displayName: "Test User",
    });
    
    expect(userRes.statusCode).toBe(201);

    // 2. Login the user
    const loginRes = await request(app).post("/users/auth/login").send({
      email: "test@test.com",
      password: "password123",
    });
    
    expect(loginRes.statusCode).toBe(200);
    const token = loginRes.headers["set-cookie"][0].split(";")[0].split("=")[1];

    // 3. Try to create a pin without media
    const pinRes = await request(app)
      .post("/pins")
      .set("Cookie", `token=${token}`)
      .send({
        title: "Test Pin",
        desc: "Description here",
      });

    // Should fail with 500 or 400 because media is required
    expect(pinRes.statusCode).not.toBe(201);
  });

  it("should fetch empty pins list correctly", async () => {
    const res = await request(app).get("/pins");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.pins)).toBeTruthy();
    expect(res.body.pins.length).toBe(0);
  });
});
