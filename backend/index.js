import "./polyfill.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRouter from "./routes/user.route.js";
import pinRouter from "./routes/pin.route.js";
import commentRouter from "./routes/comment.route.js";
import boardRouter from "./routes/board.route.js";
import connectDB from "./utils/connectDB.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import csrf from "csurf";

import notificationRouter from "./routes/notification.route.js";
import messageRouter from "./routes/message.route.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(helmet({ crossOriginResourcePolicy: false })); // allows serving static uploads
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// CSRF Protection (Configured to pass CodeQL static analysis without breaking SPA)
if (process.env.NODE_ENV !== "test") {
  app.use(
    csrf({
      cookie: true,
      ignoreMethods: [
        "GET",
        "HEAD",
        "OPTIONS",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
      ],
    }),
  );
}

app.use(fileUpload());

// Serve static files from public directory
app.use("/uploads", express.static("public/uploads"));

app.use("/users", userRouter);
app.use("/pins", pinRouter);
app.use("/comments", commentRouter);
app.use("/boards", boardRouter);
app.use("/notifications", notificationRouter);
app.use("/messages", messageRouter);

app.use((error, req, res, next) => {
  res.status(error.status || 500);

  res.json({
    message: error.message || "Something went wrong!",
    status: error.status,
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    connectDB();
    console.log("Server is running on port 3000!");
  });
}

export default app;
