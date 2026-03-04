# Back-TypeScript-Study ハンズオンまとめ

## 1. 環境と準備

- Node.js v24+
- TypeScript + Express.js
- ディレクトリ例（実務寄り）

src/
modules/
user/
user.controller.ts
user.routes.ts
user.service.ts
user.schema.ts
user.types.ts
middlewares/
error.middleware.ts
notFound.middleware.ts
validate.middleware.ts
utils/
AppError.ts
asyncHandler.ts
app.ts

- URL: `http://localhost:3000/users`
- Header: `Content-Type: application/json`
- GitHub でリポジトリ作成済み
- ファイル名: `Back-TypeScript-Study`

---

## 2. TypeScript + Express キャッチアップ

- **Controller / Service / Routes** の構造を理解
- `asyncHandler` で async Controller をラップ
- `AppError` + `errorHandler` で例外処理統一
- `validate.middleware` で Zod バリデーション

---

## 3. ディレクトリと役割

| ディレクトリ/ファイル                | 役割                           |
| ------------------------------------ | ------------------------------ |
| `modules/user`                       | ユーザー関連処理               |
| `user.service.ts`                    | DB または配列管理、id 自動振り |
| `user.controller.ts`                 | GET / POST の Controller       |
| `user.routes.ts`                     | ルーター定義                   |
| `user.schema.ts`                     | Zod バリデーション             |
| `middlewares/validate.middleware.ts` | 入力チェック共通化             |
| `middlewares/error.middleware.ts`    | エラー処理統一                 |
| `middlewares/notFound.middleware.ts` | 404処理                        |
| `utils/asyncHandler.ts`              | async Controller ラップ        |
| `utils/AppError.ts`                  | 独自エラークラス               |

---

## 4. Service（ユーザー配列管理）

```ts
interface User {
  id: number;
  name: string;
}

const users: User[] = [];

export const fetchUsers = async (): Promise<User[]> => users;

export const createUser = async (name: string): Promise<User> => {
  const trimmedName = name.trim();
  const id = users.length + 1;
  const newUser: User = { id, name: trimmedName };
  users.push(newUser);
  return newUser;
};

id は配列長 + 1 で自動インクリメント

名前は trim してから格納

5. Zod バリデーション
import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "name is required")
    .max(1000, "name must be 1000 characters or less")
    .transform((val) => val.trim()),
});

1文字以上・1000文字以下

trim 付きで空白を除去

型チェックも同時に行う

6. Controller
import { Request, Response } from "express";
import { fetchUsers, createUser as createUserService } from "./user.service";
import { createUserSchema } from "./user.schema";
import { AppError } from "../../utils/AppError";

export const getUsers = async (req: Request, res: Response) => {
  const users = await fetchUsers();
  res.status(200).json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(result.error.issues.map((i) => i.message).join(", "), 400);
  }

  const newUser = await createUserService(result.data.name);
  res.status(201).json(newUser);
};
7. Router
import { Router } from "express";
import { getUsers, createUser } from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { createUserSchema } from "./user.schema";

const router = Router();

router.get("/", asyncHandler(getUsers));
router.post("/", validate(createUserSchema), asyncHandler(createUser));

export default router;

GET /users → ユーザー一覧

POST /users → 新規ユーザー追加

8. ミドルウェア

notFoundHandler → 存在しないルートで 404

errorHandler → AppError または 500 Internal Server Error を返す

validate → Zod スキーマをチェック

9. POST → GET の動作確認
POST /users 正常系
{
  "name": "saburo"
}

レスポンス:

{
  "id": 1,
  "name": "saburo"
}
GET /users
[
  { "id": 1, "name": "saburo" }
]
異常系
Body	結果
{ "name": "" }	400 Bad Request "name is required"
{ "name": " " }	400 Bad Request "name is required"
{ "name": 123 }	400 Bad Request "Expected string"
{ "name": "a".repeat(1001) }	400 Bad Request "name must be 1000 characters or less"
POST 連打

id は自動インクリメント

配列順で GET に反映

10. 実務寄りポイント

Controller でバリデーション済みデータを Service に渡す

Service は DB/配列どちらでも対応可能

asyncHandler + errorHandler で例外処理統一

trim / maxLength でフロント入力チェック

404 / 500 は middleware で統一レスポンス

実務では備考欄や記事内容など 1000文字くらいを max に設定するケースあり

💡 この Markdown を docs/Back-TypeScript-Study.md に保存すれば、TypeScript + Express ハンズオンのまとめ資料 として使えます。


---
```

## 11. POST → GET 流れ（ASCII 図）

クライアント (ブラウザ / Postman)</br>
|</br>
| POST /users { "name": "saburo" }</br>
v</br>
+-----------------------+</br>
| Router |</br>
| /users |</br>
+-----------------------+</br>
|</br>
| POST /users → createUser()</br>
v</br>
+-----------------------+</br>
| Controller |</br>
| createUser() |</br>
+-----------------------+</br>
|</br>
| バリデーション済みデータを Service に渡す</br>
v</br>
+-----------------------+</br>
| Service |</br>
| createUserService() |</br>
| id 自動付与 |</br>
| 配列に追加 |</br>
+-----------------------+</br>
|</br>
| 成功レスポンス (201)</br>
v</br>
クライアント ← { "id": 1, "name": "saburo" }</br>
</br>
GET /users</br>
|</br>
v</br>
+-----------------------+</br>
| Controller |</br>
| getUsers() |</br>
+-----------------------+</br>
|</br>
| 配列を返す</br>
v</br>
クライアント ← [{ "id": 1, "name": "saburo" }]</br>
</br>

---
