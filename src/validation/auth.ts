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
  return /^[A-Za-zÀ-ÖØ-öø-ÿĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(value);
}

export function validateRegister(form: RegisterForm): string | null {
  const username = form.username.trim();
  const email = form.email.trim();
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();

  if (!username || !email || !firstName || !lastName || !form.password || !form.confirmPassword) {
    return "Uzupełnij wszystkie pola.";
  }

  if (username.length < 3) {
    return "Login musi mieć co najmniej 3 znaki.";
  }

  if (!isEmail(email)) {
    return "Podaj poprawny email.";
  }

  if (firstName.length < 2 || !isName(firstName)) {
    return "Podaj poprawne imię.";
  }

  if (lastName.length < 2 || !isName(lastName)) {
    return "Podaj poprawne nazwisko.";
  }

  if (form.password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków.";
  }

  if (form.password !== form.confirmPassword) {
    return "Hasła nie są takie same.";
  }

  return null;
}
