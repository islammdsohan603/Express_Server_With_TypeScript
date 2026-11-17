import bcrypt from "bcryptjs";
import AppError from "../errors/app-error.js";
import type { IStudents, IUpdateStudent } from "./stuents.interface.js";
import { pool } from "../db/index.js";
 

// Validate Student ID
const validateStudentId = (id: string) => {
  const studentId = Number(id);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new AppError(400, "Invalid Student ID");
  }

  return studentId;
};

// PostgreSQL unique constraint error
const handleDatabaseError = (error: unknown): never => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    throw new AppError(409, "This email is already registered");
  }

  throw error;
};

// 1. Create Student
const createStudentsDB = async (payload: IStudents) => {
  const { full_name, email, password, phone, age, department, marks } = payload;

  // Required Fields Check
  if (
    !full_name ||
    !email ||
    !password ||
    !phone ||
    age === undefined ||
    !department ||
    marks === undefined
  ) {
    throw new AppError(400, "All student fields are required");
  }

  // Check Existing Email
  const existingStudent = await pool.query(
    `
    SELECT id FROM student_management
    WHERE email = $1
    `,
    [email],
  );

  if (existingStudent.rows.length > 0) {
    throw new AppError(409, "This email is already registered");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const studentsData = await pool.query(
      `
      INSERT INTO student_management
      (
        full_name,
        email,
        password,
        phone,
        age,
        department,
        marks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)

      RETURNING
        id,
        full_name,
        email,
        phone,
        age,
        department,
        marks,
        is_active,
        created_at,
        updated_at
      `,
      [full_name, email, hashedPassword, phone, age, department, marks],
    );

    return studentsData.rows[0];
  } catch (error) {
    handleDatabaseError(error);
  }
};

// 2. Get All Students
const getAllStudentsDB = async () => {
  const studentsData = await pool.query(`
    SELECT
      id,
      full_name,
      email,
      phone,
      age,
      department,
      marks,
      is_active,
      created_at,
      updated_at

    FROM student_management
    ORDER BY id DESC
  `);

  return studentsData.rows;
};

// 3. Get Single Student
const getSingleStudentDB = async (id: string) => {
  const studentId = validateStudentId(id);

  const studentsData = await pool.query(
    `
    SELECT
      id,
      full_name,
      email,
      phone,
      age,
      department,
      marks,
      is_active,
      created_at,
      updated_at

    FROM student_management
    WHERE id = $1
    `,
    [studentId],
  );

  if (studentsData.rows.length === 0) {
    throw new AppError(404, "Student Not Found");
  }

  return studentsData.rows[0];
};

// 4. Update Student
const updateStudentDB = async (id: string, payload: IUpdateStudent) => {
  const studentId = validateStudentId(id);

  const { full_name, email, password, phone, age, department, marks } = payload;

  // Check whether at least one field is provided
  const hasUpdateData = Object.values(payload).some(
    (value) => value !== undefined && value !== null,
  );

  if (!hasUpdateData) {
    throw new AppError(400, "At least one field is required for update");
  }

  // Check Existing Email
  if (email) {
    const existingStudent = await pool.query(
      `
      SELECT id
      FROM student_management
      WHERE email = $1 AND id != $2
      `,
      [email, studentId],
    );

    if (existingStudent.rows.length > 0) {
      throw new AppError(409, "This email is already registered");
    }
  }

  // Hash Password only when provided
  let hashedPassword: string | null = null;

  if (password !== undefined) {
    if (!password) {
      throw new AppError(400, "Password cannot be empty");
    }

    hashedPassword = await bcrypt.hash(password, 12);
  }

  try {
    const studentsData = await pool.query(
      `
      UPDATE student_management

      SET
        full_name = COALESCE($1, full_name),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        phone = COALESCE($4, phone),
        age = COALESCE($5, age),
        department = COALESCE($6, department),
        marks = COALESCE($7, marks),
        updated_at = NOW()

      WHERE id = $8

      RETURNING
        id,
        full_name,
        email,
        phone,
        age,
        department,
        marks,
        is_active,
        created_at,
        updated_at
      `,
      [
        full_name ?? null,
        email ?? null,
        hashedPassword,
        phone ?? null,
        age ?? null,
        department ?? null,
        marks ?? null,
        studentId,
      ],
    );

    if (studentsData.rows.length === 0) {
      throw new AppError(404, "Student Not Found");
    }

    return studentsData.rows[0];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    handleDatabaseError(error);
  }
};

// 5. Delete Student
const deleteStudentDB = async (id: string) => {
  const studentId = validateStudentId(id);

  const studentsData = await pool.query(
    `
    DELETE FROM student_management
    WHERE id = $1

    RETURNING
      id,
      full_name,
      email,
      phone,
      age,
      department,
      marks
    `,
    [studentId],
  );

  if (studentsData.rows.length === 0) {
    throw new AppError(404, "Student Not Found");
  }

  return studentsData.rows[0];
};

// Export All Services
export const studentsService = {
  createStudentsDB,
  getAllStudentsDB,
  getSingleStudentDB,
  updateStudentDB,
  deleteStudentDB,
};
