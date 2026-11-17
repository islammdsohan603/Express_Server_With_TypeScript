import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { pool } from "./db/index.js";
import { studentsRouter } from "./modules/students/students.route.js";

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

app.use("/api/v1/students", studentsRouter);

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

export default app;
