
import { z } from "zod";

const eventStatus = z.enum([
  "draft",
  "published",
  "cancelled",
]);

const eventFields = {
  title: z.string().trim().min(3).max(200),
  description: z.string().nullable().optional(),
  location: z.string().trim().min(2).max(255),
  eventDate: z.string().datetime({ offset: true }),
  maxParticipants: z.number().int().positive(),
};

export const createEventSchema = z.object({
  ...eventFields,
  status: z.enum(["draft", "published"]).optional(),
});

export const updateEventSchema = z.object({
  ...eventFields,
   status: eventStatus.optional(),
});

export const updateEventStatusSchema = z.object({
  status: eventStatus,
});

export const eventQuerySchema = z.object({
  status: eventStatus.optional(),
  date: z.iso.date().optional(),
});
