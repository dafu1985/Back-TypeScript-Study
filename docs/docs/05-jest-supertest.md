# Jest + Supertest テストまとめ

## 1. 今日やったこと

- Jest + Supertest でAPIテストを実装
- 正常系・異常系のテストを作成
- テスト後にPrismaの接続を切断

---

## 2. パッケージインストール

```bash
npm install --save-dev jest supertest ts-jest @types/jest @types/supertest
```

---

## 3. jest.config.js

```javascript
/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  forceExit: true,
};

module.exports = config;
```

---

## 4. package.json（scripts）

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only ./src/server.ts",
  "test": "jest --runInBand"
}
```

`--runInBand` はテストを順番に実行するオプション。DBを使うテストで並列実行すると競合が起きるため必要。

---

## 5. auth.test.ts

```typescript
// __tests__/auth.test.ts
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
```

---

## 6. ポイントまとめ

| 項目              | 内容                             |
| ----------------- | -------------------------------- |
| `describe`        | テストのグループ化               |
| `it`              | 個別のテストケース               |
| `beforeAll`       | テスト開始前に1回実行            |
| `afterAll`        | テスト終了後に1回実行            |
| `expect`          | アサーション（期待値の検証）     |
| `request(app)`    | Suptertestでリクエストを送る     |
| `--runInBand`     | テストを順番に実行（DB競合防止） |
| `forceExit: true` | テスト終了後にJestを強制終了     |

---

## 7. テスト前にDBリセットが必要な場合

```bash
npx prisma migrate reset
```

テストで登録したデータがDBに残っている場合、正常系テストが409になってしまうため実行する。

---

## 8. テスト結果

```
✓ 正常系：ユーザー登録できる
✓ 異常系：emailが重複している場合409
✓ 異常系：nameが空の場合400

Tests: 3 passed, 3 total
```
