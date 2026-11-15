import dotenv from "dotenv";
import type { Request, Response } from "express";
import express from "express";
import { Pool } from "pg";
dotenv.config();
const app = express();

app.use(express.json()); // for parsing application/json

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// console.log(pool);

const initDB = async () => {
  try {
    await pool.query(`
      
      CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,

      is_Active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      );

      `);
    console.log("DataBase Connected");
  } catch (error) {
    console.log(error);
  }
};

initDB();
// Get port from environment variable
const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Express with TypeScript Server is running",
    author: "SOHAN",
  });
});

app.post("/", async (req: Request, res: Response) => {
  const { name, age, password } = req.body;

  res.status(200).json({
    success: true,
    message: "Post method",
    data: { name, age },
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
