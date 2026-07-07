import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Pin from "../models/pin.model.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret_pin";
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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe("Pin Interaction Tests", () => {
  it("should mock interactions and check stats", async () => {
    const userRes = await request(app).post("/users/auth/register").send({
      username: "pinner",
      email: "pinner@test.com",
      password: "password123",
      displayName: "Pinner",
    });

    const loginRes = await request(app).post("/users/auth/login").send({
      email: "pinner@test.com",
      password: "password123",
    });
    const token = loginRes.headers["set-cookie"][0].split(";")[0].split("=")[1];
    const userId = loginRes.body._id;

    // Direct DB insertion for Pin to bypass S3 upload logic
    const pin = await Pin.create({
      title: "Test Pin",
      description: "Cool pin",
      media: "dummy.jpg",
      width: 500,
      height: 500,
      user: userId,
    });

    const pinId = pin._id.toString();

    // 1. Like the pin
    const likeRes = await request(app)
      .post(`/pins/interact/${pinId}`)
      .set("Cookie", `token=${token}`)
      .send({ type: "like" });
    expect(likeRes.statusCode).toBe(200);

    // 2. Save the pin
    const saveRes = await request(app)
      .post(`/pins/interact/${pinId}`)
      .set("Cookie", `token=${token}`)
      .send({ type: "save" });
    expect(saveRes.statusCode).toBe(200);

    // 3. Interaction Check
    const checkRes = await request(app)
      .get(`/pins/interaction-check/${pinId}`)
      .set("Cookie", `token=${token}`);

    expect(checkRes.statusCode).toBe(200);
    expect(checkRes.body.isLiked).toBe(true);
    expect(checkRes.body.isSaved).toBe(true);
    expect(checkRes.body.likeCount).toBe(1);

    const savedRes = await request(app).get(`/pins/saved/${userId}`);
    expect(savedRes.statusCode).toBe(200);
    expect(savedRes.body.pins.length).toBe(1);
    expect(savedRes.body.pins[0]._id).toBe(pinId);
  });
});
