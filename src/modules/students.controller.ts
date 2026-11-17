import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { pool } from "../db/index.js";

const createStudents = async (req: Request, res: Response) => {
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
};

export const studentsController = {
  createStudents,
};
