
import { z } from "zod";

const uuidSchema = z.string().uuid();

export const createRegistrationSchema = z.object({
  eventId: uuidSchema,
  participantId: uuidSchema,
});

export const registrationQuerySchema = z.object({
  eventId: uuidSchema.optional(),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
});

export const updateRegistrationStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
