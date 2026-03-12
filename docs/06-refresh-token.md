# Refresh Token実装まとめ

## 1. 今日やったこと

- Refresh Token実装（バックエンド・フロントエンド）
- AccessToken（15分）+ RefreshToken（7日）の発行
- AccessToken切れ時に自動でRefreshTokenで再取得
- ログアウト時にDBのRefreshTokenを無効化

---

## 2. バックエンド

### schema.prisma（refreshToken追加）

```prisma
model User {
  id           Int     @id @default(autoincrement())
  name         String
  email        String  @unique
  password     String
  refreshToken String?
}
```

### auth.service.ts

```typescript
// ログイン
export const login = async (email: string, password: string) => {
  // AccessToken（15分）
  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "15m",
  });

  // RefreshToken（7日）
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // DBにRefreshTokenを保存
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
};

// トークンリフレッシュ
export const refresh = async (token: string) => {
  const decoded = jwt.verify(token, REFRESH_SECRET) as { userId: number };
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // DBのRefreshTokenと一致するか確認
  if (!user || user.refreshToken !== token) {
    throw new AppError("Invalid refresh token", 401);
  }

  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "15m",
  });
  return { accessToken };
};

// ログアウト
export const logout = async (userId: number) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};
```

### auth.routes.ts

```typescript
router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", authMiddleware, asyncHandler(logout));
```

---

## 3. フロントエンド

### src/api/auth.ts（インターセプター更新）

```typescript
// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:3000/auth/refresh", {
            refreshToken,
          });
          localStorage.setItem("accessToken", res.data.accessToken);
          // 失敗したリクエストを再試行
          error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return axios(error.config);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("accessToken", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);
  return res.data;
};

export const logout = async () => {
  await api.post("/auth/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};
```

---

## 4. ポイントまとめ

| 項目             | 内容                                                      |
| ---------------- | --------------------------------------------------------- |
| AccessToken      | 有効期限15分・認証に使用                                  |
| RefreshToken     | 有効期限7日・DBに保存                                     |
| トークン自動更新 | 401エラー時にRefreshTokenで再取得し失敗リクエストを再試行 |
| ログアウト       | DBのRefreshTokenをnullにして無効化                        |
| `error.config`   | 失敗したリクエストの設定情報・再試行に使用                |
