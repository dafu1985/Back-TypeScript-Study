# JWT認証まとめ

## 1. 今日やったこと

- `bcrypt` でパスワードハッシュ化
- JWT発行・検証
- 認証ミドルウェア実装
- 未認証は401、認証済みのみアクセス可能に

---

## 2. パッケージインストール

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

---

## 3. schema.prisma（Userモデル更新）

```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
}
```

マイグレーション実行：

```bash
npx prisma migrate dev --name add-auth-fields
npx prisma generate
```

---

## 4. auth.schema.ts

```typescript
// src/modules/auth/auth.schema.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("invalid email"),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(1, "password is required"),
});
```

---

## 5. auth.service.ts

```typescript
// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { AppError } from "../../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ユーザー登録
export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return { id: user.id, name: user.name, email: user.email };
};

// ログイン
export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

  return { token };
};
```

---

## 6. auth.controller.ts

```typescript
// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import {
  register as registerService,
  login as loginService,
} from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { AppError } from "../../utils/AppError";

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      result.error.issues.map((i) => i.message).join(", "),
      400,
    );
  }

  const newUser = await registerService(
    result.data.name,
    result.data.email,
    result.data.password,
  );
  res.status(201).json(newUser);
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      result.error.issues.map((i) => i.message).join(", "),
      400,
    );
  }

  const { token } = await loginService(result.data.email, result.data.password);
  res.json({ token });
};
```

---

## 7. auth.routes.ts

```typescript
// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { register, login } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;
```

---

## 8. auth.middleware.ts

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
  (req as any).userId = decoded.userId;

  next();
};
```

---

## 9. user.routes.ts（認証追加後）

```typescript
// src/modules/user/user.routes.ts
import { Router } from "express";
import { getUsers, updateUser, deleteUser } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { updateUserSchema } from "./user.schema";

const router = Router();

router.get("/", authMiddleware, asyncHandler(getUsers));
router.patch(
  "/:id",
  authMiddleware,
  validate(updateUserSchema),
  asyncHandler(updateUser),
);
router.delete("/:id", authMiddleware, asyncHandler(deleteUser));

export default router;
```

---

## 10. ポイントまとめ

| 項目             | 内容                                                     |
| ---------------- | -------------------------------------------------------- |
| パスワード保存   | `bcrypt.hash()` でハッシュ化して保存                     |
| ソルトラウンド   | `10` が実務標準                                          |
| トークン発行     | `jwt.sign()` でJWT生成                                   |
| トークン検証     | `jwt.verify()` でミドルウェアが検証                      |
| エラーメッセージ | emailとpassword両方「Invalid」で統一（セキュリティ対策） |
| パスワード除外   | `select` でレスポンスから除外                            |

---

## 11. APIフロー

```
POST /auth/register → ユーザー登録（パスワードはハッシュ化して保存）
POST /auth/login    → JWTトークン返却
GET  /users         → Authorizationヘッダーにトークンが必要
```
