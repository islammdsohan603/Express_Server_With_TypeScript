import express from "express";
import dotenv from "dotenv";
import type { Request, Response } from "express";
dotenv.config();
const app = express();

app.use(express.json()); // for parsing application/json

// Get port from environment variable
const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Express with TypeScript Server is running",
    author: "SOHAN",
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
