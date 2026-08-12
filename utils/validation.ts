export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validates if a password meets the strength requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 *
 * Returns only the requirements that are currently missing.
 */
export const validatePassword = (
  password: string,
): { isValid: boolean; message: string; missing: string[] } => {
  if (!password) {
    return { isValid: false, message: "Please enter a password.", missing: ["a password"] };
  }

  const missing: string[] = [];

  if (password.length < 8) {
    missing.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    missing.push("an uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    missing.push("a lowercase letter");
  }
  if (!/\d/.test(password)) {
    missing.push("a number");
  }
  if (!/[@$!%*?&]/.test(password)) {
    missing.push("a special character (e.g., @$!%*?&)");
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      message: `Password is missing: ${missing.join(", ")}.`,
      missing,
    };
  }

  return { isValid: true, message: "", missing: [] };
};
