import { Pool } from "pg";
import config from "../config/index.js";

// Database Connection
export const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Database connection error
pool.on("error", (error) => {
  console.error("Unexpected Database Error:", error);
});

// Database Table Create
export const initDataBase = async () => {
  try {
    // 1. Student Table Create
    console.log("Creating Student Table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_management (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        age SMALLINT NOT NULL,
        department VARCHAR(100) NOT NULL,
        marks DECIMAL(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Existing Database Migration
    console.log("Running Student Table Migration...");

    await pool.query(`
      ALTER TABLE student_management
      ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `);

    await pool.query(`
      ALTER TABLE student_management
      ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

    // 3. Remove Old Password Unique Constraint
    await pool.query(`
      ALTER TABLE student_management
      DROP CONSTRAINT IF EXISTS student_management_password_key;
    `);

    // 4. Check Duplicate Emails
    console.log("Checking Duplicate Emails...");

    const duplicateEmails = await pool.query(`
      SELECT email, COUNT(*) AS total
      FROM student_management
      WHERE email IS NOT NULL
      GROUP BY email
      HAVING COUNT(*) > 1;
    `);

    if (duplicateEmails.rows.length > 0) {
      throw new Error(
        "Duplicate emails found. Please fix duplicate email records first.",
      );
    }

    // 5. Create Unique Email Index
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      student_management_email_unique_idx
      ON student_management(email);
    `);

    // 6. Create Profile Table
    console.log("Creating Profile Table...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile (
        id SERIAL PRIMARY KEY,

        student_id INTEGER NOT NULL UNIQUE
          REFERENCES student_management(id)
          ON DELETE CASCADE,

        bio TEXT,
        address TEXT,
        gender VARCHAR(15),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database Tables Created Successfully!");
  } catch (error) {
    console.error("Database Initialization Failed:", error);
    throw error;
  }
};
