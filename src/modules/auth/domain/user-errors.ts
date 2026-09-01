export type LoginError = "INVALID_CREDENTIALS" | "VALIDATION" | "RATE_LIMITED";
export type CreateUserError =
  | "DUPLICATE_EMAIL"
  | "VALIDATION"
  | "UNAUTHORIZED";
export type DeleteUserError = "NOT_FOUND" | "LAST_ADMIN" | "UNAUTHORIZED";
export type SeedAdminError = "ALREADY_SEEDED" | "VALIDATION";
