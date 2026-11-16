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

const initDataBase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_management (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      age SMALLINT NOT NULL,
      department VARCHAR(100) NOT NULL,
      marks DECIMAL(5,2) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()

      );
      `);
    console.log("DataBase Connected Successfully!!");
  } catch (error) {
    console.log(error);
  }
};

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

const startServer = async () => {
  try {
    await initDataBase();

    app.listen(port, () => {
      console.log(`Server is Running on ${port}`);
    });
  } catch (error) {
    console.error("Server Startup Failed:", error);
    process.exit(1);
  }
};

startServer();
