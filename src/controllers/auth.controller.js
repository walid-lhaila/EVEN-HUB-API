
import { loginUser, getCurrentUser } from "../services/auth.service.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.status(200).json({
      message: "Connexion réussie",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}


export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    return res.status(200).json({
      message: "Utilisateur récupéré avec succès",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}