import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { Pool } from "pg";
const app = express();
dotenv.config();
app.use(express.json());

const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: "Server is Connected Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is Running on ${port}`);
});
