export type RegisterForm = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

const MSG_REQUIRED = "Uzupełnij wszystkie pola.";
const MSG_USERNAME_LEN = "Login musi mieć co najmniej 3 znaki.";
const MSG_PASSWORD_LEN = "Hasło musi mieć co najmniej 8 znaków.";
const MSG_PASSWORD_MATCH = "Hasła nie są takie same.";
const MSG_INVALID_EMAIL = "Podaj poprawny email.";
const MSG_INVALID_NAME = "Podaj poprawne imię i nazwisko (min 2 znaki).";

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