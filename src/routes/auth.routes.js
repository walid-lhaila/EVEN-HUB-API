import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validators/auth.validator.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";


const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authenticateToken, me);
router.get( "/admin-only", authenticateToken, authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Bienvenue Admin !" });
  }
);
export default router;
