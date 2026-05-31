import type { CopyCode } from "@/src/i18n/copy";

export type RegisterForm = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isName(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(value) && value.length >= 2;
}

function isUsername(value: string) {
  return /^[A-Za-z0-9_]+$/.test(value) && value.length >= 3;
}

function isPassword(value: string) {
  return value.length >= 8;
}

export function validateRegister(form: RegisterForm): CopyCode | null {
  const username = form.username.trim();
  const email = form.email.trim();
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();

  if (!username || !email || !firstName || !lastName || !form.password || !form.confirmPassword) {
    return "validation_required";
  }

  if (!isUsername(username)) {
    return "validation_username_len";
  }

  if (!isEmail(email)) {
    return "validation_invalid_email";
  }

  if (!isName(firstName) || !isName(lastName)) {
    return "validation_invalid_name";
  }

  if (!isPassword(form.password)) {
    return "validation_password_len";
  }

  if (form.password !== form.confirmPassword) {
    return "validation_password_match";
  }

  return null;
}

export function validateLogin(username: string, password: string): CopyCode | null {
  if (!username.trim() || !password) {
    return "validation_required";
  }
  if (!isUsername(username.trim())) {
    return "validation_username_len";
  }
  if (!isPassword(password)) {
    return "validation_password_len";
  }
  return null;
}
