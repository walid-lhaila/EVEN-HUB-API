
import "dotenv/config";

const requiredVariables = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET"
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

export const env = {
  port: Number(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  nodeEnv: process.env.NODE_ENV || "development",
};
