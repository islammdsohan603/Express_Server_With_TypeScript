import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { Pool } from "pg";

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Database Table Create
const initDataBase = async () => {
  try {
    // 1. Create Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_management (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        age SMALLINT NOT NULL,
        department VARCHAR(100) NOT NULL,
        marks DECIMAL(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Add Email Column if it does not exist
    await pool.query(`
      ALTER TABLE student_management
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
    `);

    await pool.query(`
      ALTER TABLE student_management
      ADD COLUMN IF NOT EXISTS password VARCHAR(255) UNIQUE;
      `);

    console.log("DataBase Table Created Successfully!");
  } catch (error) {
    console.log("Database Error:", error);
    throw error;
  }
};

// Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is Connected Successfully",
  });
});

// POST Method - Create Student

app.post("/api/v1/students", async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone, age, department, marks } =
      req.body;

    const studentsData = await pool.query(
      `
      INSERT INTO student_management
      (full_name, email, password, phone, age, department, marks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [full_name, email, password, phone, age, department, marks],
    );

    return res.status(201).json({
      success: true,
      message: "Student Created Successfully",
      data: studentsData.rows[0],
    });
  } catch (error) {
    console.log("POST STUDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Get Method - Show Students Data

app.get("/api/v1/students", async (req: Request, res: Response) => {
  try {
    const studentsData = await pool.query(`
      SELECT * FROM student_management
      `);
    res.status(200).json({
      success: true,
      message: "Students Data show in Successfully",
      data: studentsData.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Error in Get Students data",
    });
  }
});

// Get Method - in Single Students Data

app.get("/api/v1/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const studentsData = await pool.query(
      `
      SELECT * FROM student_management
      WHERE id = $1
      `,
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Student Data Retrieved Successfully",
      data: studentsData.rows[0],
    });
  } catch (error) {
    console.log("GET SINGLE STUDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Start Server
const startServer = async () => {
  try {
    await initDataBase();

    app.listen(port, () => {
      console.log(`Server is Running on ${port}`);
    });
  } catch (error) {
    console.log("Server Startup Failed:", error);
    process.exit(1);
  }
};

startServer();
