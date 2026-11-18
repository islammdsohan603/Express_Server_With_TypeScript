import { Router } from "express";

import { StudentsProfile } from "./profile.controller.js";

const router = Router();

router.post("/", StudentsProfile.createProfile);

export const profileRoute = router;
