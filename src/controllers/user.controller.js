import { findAllUsers } from "../services/user.service.js";

export async function getAllUsers(req, res, next) {
  try {
    const users = await findAllUsers();

    return res.status(200).json({
      message: "Utilisateurs récupérés avec succès",
      data: users,
    });
  } catch (error) {
    return next(error);
  }
}