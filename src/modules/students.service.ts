import bcrypt from "bcryptjs";
import { pool } from "../db/index.js";

const createStudentsDB = async (palyoad: any) => {
  const { full_name, email, password, phone, age, department, marks } = palyoad;
  // Required fields check
  if (!full_name || !email || !password) {
    return palyoad.status(404).json({
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
    return palyoad.status(409).json({
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

  return studentsData;
};

export const studentsService = {
  createStudentsDB,
};
