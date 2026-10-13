
import { getDashboardStats } from "../services/dashboard.service.js";

export async function getDashboard(req, res, next) {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json({
      message: "Statistiques récupérées avec succès",
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
}
