
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Token manquant");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 console.log(decoded);
 
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch {
    const error = new Error("Token invalide ou expiré");
    error.statusCode = 401;
    next(error);
  }
}
