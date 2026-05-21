import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import globalErrorHandlers from "./middlewares/globalErrorHandlers.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { issueRouter } from "./modules/issues/issue.route.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({
    success: true,
    message: "DevPulse API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    errors: `Route ${req.originalUrl} not found`,
  });
});

app.use(globalErrorHandlers);

export default app;
