import express, { type Request, type Response } from "express";

import { studentsRouter } from "./modules/students/students.route.js";

const app = express();

// Middleware
app.use(express.json());

// Root Route
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Server is Connected Successfully",
  });
});

// Students Module
app.use("/api/v1/students", studentsRouter);

export default app;
