import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  getAllUsers
);

export default router;