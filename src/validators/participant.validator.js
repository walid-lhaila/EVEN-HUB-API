
import { z } from "zod";

const participantFields = {
  fullName: z.string().trim().min(2).max(150),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().nullable(),
};

export const createParticipantSchema = z.object({
  ...participantFields,
});

export const updateParticipantSchema = z.object({
  ...participantFields,
});

export const participantQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
});
