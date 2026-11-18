import type { Request, Response } from "express";
import { profileService } from "./profile.service.js";

const createProfile = async (req: Request, res: Response) => {
  try {
    const result = await profileService.createProfileIntDB(req.body);

    res.status(201).json({
      success: true,
      message: "Profile Create Successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Students Data Error in Server",
    });
  }
};

export const StudentsProfile = {
  createProfile,
};
