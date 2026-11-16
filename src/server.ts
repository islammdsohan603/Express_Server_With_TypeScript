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
      
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
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
  });
});

app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const result = await pool.query(
      `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, is_active, created_at
      `,
      [name, email, password],
    );

    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
      `);

    res.status(200).json({
      success: true,
      message: "User Get Successfully!",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// single users data

app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE id=$1
      `,
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Single Users data Show",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error ",
    });
  }
});

app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const result = await pool.query(
      `
        UPDATE users
        SET
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          password = COALESCE($3, password),
          updated_at = NOW()
        WHERE id = $4
        RETURNING id, name, email, is_active, created_at, updated_at
      `,
      [name ?? null, email ?? null, password ?? null, id],
    );

    res.status(200).json({
      success: true,
      message: "Users Data Updated Successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
