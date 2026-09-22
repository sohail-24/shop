import "dotenv/config";

function getEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL"),
  adminEmail: getEnv("ADMIN_EMAIL", "admin@freshflow.com"),
  adminPassword: getEnv("ADMIN_PASSWORD", "admin123"),
  jwtAccessSecret: getEnv("JWT_ACCESS_SECRET", "freshflow-jwt-access-secret-32-chars-long!"),
  jwtRefreshSecret: getEnv("JWT_REFRESH_SECRET", "freshflow-jwt-refresh-secret-32-chars-long!"),
  mockOtpCode: process.env.MOCK_OTP_CODE ?? "123456",
  ownerEmail: process.env.OWNER_EMAIL ?? "owner@freshflow.com",
  adminOrderEmail: process.env.ADMIN_ORDER_EMAIL ?? process.env.OWNER_EMAIL ?? "orders@freshflow.com",
  appUrl: process.env.APP_URL ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpFrom: process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? "FreshFlow <orders@freshflow.com>",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
};
