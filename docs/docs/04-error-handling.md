# エラーハンドリング強化まとめ

## 1. 今日やったこと

- Prismaエラーを `errorHandler` で拾えるように修正
- 存在しない `id` → `404 Not Found`
- email重複 → `409 Conflict`

---

## 2. 問題点（修正前）

存在しない `id` にPATCHすると `500 Internal Server Error` が返っていた。

Prismaは独自のエラー（`PrismaClientKnownRequestError`）を投げるが、
修正前の `errorHandler` は `AppError` しか拾えていなかった。

---

## 3. error.middleware.ts（修正後）

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  // AppErrorの場合
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Prismaのエラーの場合
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // レコードが見つからない
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    // ユニーク制約違反（emailの重複など）
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "Already exists",
      });
    }
  }

  // 想定外エラー
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
```

---

## 4. Prismaエラーコード一覧（今回使用分）

| エラーコード | 状況                              | HTTPステータス              |
| ------------ | --------------------------------- | --------------------------- |
| `P2025`      | レコードが見つからない            | `404 Not Found`             |
| `P2002`      | ユニーク制約違反（email重複など） | `409 Conflict`              |
| その他       | 想定外エラー                      | `500 Internal Server Error` |

---

## 5. 動作確認

### 存在しないidにPATCH → 404

```http
PATCH http://localhost:3000/users/999
Authorization: Bearer {token}
Content-Type: application/json

{ "name": "test" }
```

```json
{
  "status": "error",
  "message": "Record not found"
}
```

### 同じemailで登録 → 409

```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "saburo2",
  "email": "saburo@example.com",
  "password": "password123"
}
```

```json
{
  "status": "error",
  "message": "Already exists"
}
```

---

## 6. ポイントまとめ

- `Prisma.PrismaClientKnownRequestError` で Prisma独自エラーを拾える
- エラーコードで細かく分岐できる
- `AppError` → Prismaエラー → 想定外エラーの順でチェックする
