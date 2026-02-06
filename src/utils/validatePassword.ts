export type PasswordLevel = "very-weak" | "weak" | "medium" | "strong";

export const checkPasswordStrength = (password: string) => {
  if (!password) {
    return null;
  }

  if (password.length < 6) {
    return {
      level: "very-weak" as const,
      label: "Muy corta (mín. 6 caracteres)",
      color: "text-red-500",
      bar: "w-1/4 bg-red-500",
    };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      level: "weak" as const,
      label: "Débil",
      color: "text-orange-500",
      bar: "w-2/4 bg-orange-500",
    };
  }

  if (score === 2 || score === 3) {
    return {
      level: "medium" as const,
      label: "Media",
      color: "text-yellow-500",
      bar: "w-3/4 bg-yellow-500",
    };
  }

  return {
    level: "strong" as const,
    label: "Fuerte",
    color: "text-green-600",
    bar: "w-full bg-green-500",
  };
};
