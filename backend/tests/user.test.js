import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from "supertest";
import app from "../index.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret_user";
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

describe("User & Follow System Tests", () => {
  it("should handle user registration, profile fetch, and follow/unfollow cycles", async () => {
    // 1. Create two users
    const user1 = await request(app).post("/users/auth/register").send({
      username: "alpha",
      email: "alpha@test.com",
      password: "password123",
      displayName: "Alpha User",
    });
    const user2 = await request(app).post("/users/auth/register").send({
      username: "beta",
      email: "beta@test.com",
      password: "password123",
      displayName: "Beta User",
    });

    // 2. Login as Alpha
    const loginRes = await request(app).post("/users/auth/login").send({
      email: "alpha@test.com",
      password: "password123",
    });
    const token = loginRes.headers["set-cookie"][0].split(";")[0].split("=")[1];

    // 3. Alpha follows Beta
    const followRes = await request(app)
      .post(`/users/follow/beta`)
      .set("Cookie", `token=${token}`);
    expect(followRes.statusCode).toBe(200);

    // 4. Fetch Beta's profile
    const betaProfile = await request(app)
      .get(`/users/beta`)
      .set("Cookie", `token=${token}`);
    
    expect(betaProfile.statusCode).toBe(200);
    expect(betaProfile.body.followerCount).toBe(1);
    expect(betaProfile.body.isFollowing).toBe(true); // Alpha is following Beta

    // 5. Alpha unfollows Beta (toggle)
    const unfollowRes = await request(app)
      .post(`/users/follow/beta`)
      .set("Cookie", `token=${token}`);
    expect(unfollowRes.statusCode).toBe(200);

    // 6. Verify unfollow
    const betaProfileAfter = await request(app)
      .get(`/users/beta`)
      .set("Cookie", `token=${token}`);
    expect(betaProfileAfter.body.followerCount).toBe(0);
    expect(betaProfileAfter.body.isFollowing).toBe(false);
  });
});
