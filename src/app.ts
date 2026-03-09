import express from "express";
import cors from "cors";
import userRouter from "./modules/user/user.routes";
import authRouter from "./modules/auth/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/users", userRouter);
app.use("/auth", authRouter);

// 404
app.use(notFoundHandler);

// error
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;