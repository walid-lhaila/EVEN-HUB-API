
import { Router } from "express";
import { createRegistration, getRegistrations, updateRegistrationStatus } from "../controllers/registration.controller.js";
import { createRegistrationSchema, registrationQuerySchema, updateRegistrationStatusSchema } from "../validators/registration.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();
const registrationManagers = [authenticateToken, authorizeRoles("staff"),];

router.post("/",...registrationManagers,validate(createRegistrationSchema),createRegistration);
router.get("/",...registrationManagers,validateRegistrationQuery,getRegistrations);
router.patch("/:id/status",...registrationManagers,validate(updateRegistrationStatusSchema),updateRegistrationStatus);

function validateRegistrationQuery(req, res, next) {
  const result = registrationQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Filtres invalides",
      errors: result.error.issues,
    });
  }

  req.validatedQuery = result.data;
  return next();
}

export default router;
