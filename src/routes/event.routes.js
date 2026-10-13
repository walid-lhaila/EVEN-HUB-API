
import { Router } from "express";
import { getEvents, getEvent, createEvent, updateEvent, updateEventStatus } from "../controllers/event.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {createEventSchema,updateEventSchema,updateEventStatusSchema,eventQuerySchema } from "../validators/event.validator.js";

const router = Router();

const eventManagers = [ authenticateToken, authorizeRoles("admin", "staff") ];

router.get("/", ...eventManagers, validateQuery, getEvents);
router.get("/:id",...eventManagers, getEvent);
router.post("/",...eventManagers,validate(createEventSchema),createEvent);
router.put("/:id",...eventManagers,validate(updateEventSchema),updateEvent);
router.patch("/:id/status",...eventManagers,validate(updateEventStatusSchema),updateEventStatus);

function validateQuery(req, res, next) {
  const result = eventQuerySchema.safeParse(req.query);

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
