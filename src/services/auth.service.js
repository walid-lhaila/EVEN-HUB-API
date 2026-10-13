
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database/pool.js";

export async function loginUser(email, password) {
  const result = await pool.query(
    `SELECT id, full_name, email, password_hash, role
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("Email ou mot de passe incorrect");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    const error = new Error("Email ou mot de passe incorrect");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function getCurrentUser(userId) {
  const result = await pool.query(
    `SELECT id, full_name, email, role, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error("Utilisateur introuvable");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}
