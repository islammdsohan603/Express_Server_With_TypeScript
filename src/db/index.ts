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

    // Existing database-এর জন্য migration
    await pool.query(`
      ALTER TABLE student_management
      ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    `);

    await pool.query(`
      ALTER TABLE student_management
      ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

    // Email unique রাখবে
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      student_management_email_unique_idx
      ON student_management(email);
    `);

    // Password কখনো unique হওয়া প্রয়োজন নেই
    await pool.query(`
      ALTER TABLE student_management
      DROP CONSTRAINT IF EXISTS student_management_password_key;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile(
      id SERIAL PRIMARY KEY,
      student_id INT UNIQUE REFERENCES student_management(id) ON DELETE CASCADE,
      bio TEXT,
      address TEXT,
      gender VARCHAR(15),

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
      `);

    console.log("Database Table Created Successfully!");
  } catch (error) {
    console.error("Database Error:", error);
    throw error;
  }
};
