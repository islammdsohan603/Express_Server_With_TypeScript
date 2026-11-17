import { Pool } from "pg";
import config from "../config/index.js";

// Database Connection
export const pool = new Pool({
  connectionString: config.connection_String,
});

// Database Table Create
export const initDataBase = async () => {
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
