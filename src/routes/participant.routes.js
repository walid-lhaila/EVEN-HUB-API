
import { Router } from "express";
import {createParticipant,getParticipants,updateParticipant } from "../controllers/participant.controller.js";
import {createParticipantSchema,updateParticipantSchema,participantQuerySchema } from "../validators/participant.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();
const ParticipantManagers = [authenticateToken, authorizeRoles("staff"),];
router.post("/",validate(createParticipantSchema), ParticipantManagers,createParticipant);
router.get("/", validateParticipantQuery, ParticipantManagers, getParticipants);
router.put("/:id",validate(updateParticipantSchema), ParticipantManagers, updateParticipant
);

function validateParticipantQuery(req, res, next) {
  const result = participantQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      message: "Paramètres de recherche invalides",
      errors: result.error.issues,
    });
  }

  req.validatedQuery = result.data;
  return next();
}

export default router;
