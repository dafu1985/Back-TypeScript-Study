// src/__tests__/auth.test.ts
import request from "supertest";
import app from "../src/app";
import prisma from "../src/utils/prisma";

describe("POST /auth/register", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("正常系：ユーザー登録できる", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.password).toBeUndefined();
  });

  it("異常系：emailが重複している場合409", async () => {
    await request(app).post("/auth/register").send({
      name: "testuser",
      email: "dup@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/register").send({
      name: "testuser2",
      email: "dup@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
  });

  it("異常系：nameが空の場合400", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "",
      email: "empty@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});