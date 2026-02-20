export type RegisterForm = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

// These will be replaced by content context at runtime
export const MSG_REQUIRED = "Fill required fields";
export const MSG_USERNAME_LEN = "Username must be at least 3 characters long";
export const MSG_PASSWORD_LEN = "Password must be at least 8 characters long";
export const MSG_PASSWORD_MATCH = "Passwords do not match";
export const MSG_INVALID_EMAIL = "Invalid email address";
export const MSG_INVALID_NAME = "Invalid name";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isName(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(value) && value.length >=2;
}

function isUsername(value: string) {
    return /^[A-Za-z0-9_]+$/.test(value) && value.length >=3;
    }

function isPassword(value: string) {
    return value.length >=8;
}

export function validateRegister(form: RegisterForm): string | null {
  const username = form.username.trim();
  const email = form.email.trim();
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();

  if (!username || !email || !firstName || !lastName || !form.password || !form.confirmPassword) {
    return MSG_REQUIRED;
  }

  if (!isUsername(username)) {
    return MSG_USERNAME_LEN;
  }

  if (!isEmail(email)) {
    return MSG_INVALID_EMAIL;
  }

  if (!isName(firstName) || !isName(lastName)) {
    return MSG_INVALID_NAME;
  }

  if (!isPassword(form.password)) {
    return MSG_PASSWORD_LEN;
  }

  if (form.password !== form.confirmPassword) {
    return MSG_PASSWORD_MATCH;
  }

  return null;
}


export function validateLogin(username: string, password: string): string | null {
    if (!username.trim() || !password) {
        return MSG_REQUIRED;
    }
    if (!isUsername(username.trim())) {
        return MSG_USERNAME_LEN;
    }
    if (!isPassword(password)) {
        return MSG_PASSWORD_LEN;
    }
  return null;
}   