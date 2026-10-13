import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Format d'email invalide"),

  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire"),
});