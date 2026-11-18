import { pool } from "../../db/index.js";
import type { ICreateProfile } from "./student.interface.js";

const createProfileIntDB = async (payload: ICreateProfile) => {
  const { student_id, bio, address, gender } = payload;

  const result = await pool.query(
    `
      INSERT INTO profile
      (student_id, bio, address, gender)

      VALUES ($1, $2, $3, $4)

      RETURNING *
    `,
    [student_id, bio ?? null, address ?? null, gender ?? null],
  );

  return result;
};

export const profileService = {
  createProfileIntDB,
};
