import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/",authenticateToken,authorizeRoles("admin", "staff"),getDashboard);

export default router;
