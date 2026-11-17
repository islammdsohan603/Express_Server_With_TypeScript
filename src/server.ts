import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import config from "./config/index.js";
import { initDataBase, pool } from "./db/index.js";

dotenv.config();

const app = express();
app.use(express.json());

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
    // Required fields check
    if (!full_name || !email || !password) {
      return res.status(404).json({
        success: false,
        message: "Name, Email and Password are required",
      });
    }
    // Check if email alrady exists
    const existingStudent = await pool.query(
      ` 
  SELECT id FROM student_management
  WHERE email=$1
  `,
      [email],
    );

    if (existingStudent.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const hasPassword = await bcrypt.hash(password, 12);

    const studentsData = await pool.query(
      `
      INSERT INTO student_management
      (full_name, email, password, phone, age, department, marks)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [full_name, email, hasPassword, phone, age, department, marks],
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
      data: studentsData.rows,
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

// Put Method - single Students Data

app.put("/api/v1/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, password } = req.body;

    // 1. Check if email already exists
    if (email) {
      const existingStudent = await pool.query(
        `
        SELECT id FROM student_management
        WHERE email = $1 AND id != $2
        `,
        [email, id],
      );

      if (existingStudent.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered",
        });
      }
    }

    // 2. Hash password only if provided
    const hasPassword = password ? await bcrypt.hash(password, 12) : null;

    // 3. Update Student Data
    const studentsData = await pool.query(
      `
      UPDATE student_management
      SET
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, full_name, email, phone, age, department, marks, updated_at
      `,
      [full_name ?? null, email ?? null, hasPassword, id],
    );

    // 4. Check if Student exists
    if (studentsData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student Data Updated Successfully",
      data: studentsData.rows[0],
    });
  } catch (error) {
    console.log("UPDATE STUDENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Deleted Method - Students Data

app.delete("/api/v1/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentsData = await pool.query(
      `
      DELETE FROM student_management
      WHERE id=$1

      RETURNING *
      `,
      [id],
    );

    if (studentsData.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User Data Not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Students Data Deleted Successfully",
      data: studentsData.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Error for Deleted in Students Data",
    });
  }
});

// Start Server
const startServer = async () => {
  try {
    await initDataBase();

    app.listen(config.port, () => {
      console.log(`Server is Running on ${config.port}`);
    });
  } catch (error) {
    console.log("Server Startup Failed:", error);
    process.exit(1);
  }
};

startServer();
