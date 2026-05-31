import { validateLogin, validateRegister } from "@/src/validation/auth";

const validRegister = {
  username: "testuser",
  email: "user@example.com",
  firstName: "Jan",
  lastName: "Kowalski",
  password: "password1",
  confirmPassword: "password1",
};

describe("validateRegister", () => {
  it("returns null for a valid form", () => {
    expect(validateRegister(validRegister)).toBeNull();
  });

  it("returns validation_required when a field is empty", () => {
    expect(validateRegister({ ...validRegister, email: "" })).toBe("validation_required");
  });

  it("returns validation_username_len for short or invalid username", () => {
    expect(validateRegister({ ...validRegister, username: "ab" })).toBe("validation_username_len");
    expect(validateRegister({ ...validRegister, username: "bad-name" })).toBe(
      "validation_username_len"
    );
  });

  it("returns validation_invalid_email for malformed email", () => {
    expect(validateRegister({ ...validRegister, email: "not-an-email" })).toBe(
      "validation_invalid_email"
    );
  });

  it("returns validation_invalid_name for invalid names", () => {
    expect(validateRegister({ ...validRegister, firstName: "A" })).toBe("validation_invalid_name");
    expect(validateRegister({ ...validRegister, lastName: "123" })).toBe("validation_invalid_name");
  });

  it("accepts names with Polish diacritics", () => {
    expect(
      validateRegister({ ...validRegister, firstName: "Łukasz", lastName: "Żółć" })
    ).toBeNull();
  });

  it("returns validation_password_len for short password", () => {
    expect(validateRegister({ ...validRegister, password: "short" })).toBe(
      "validation_password_len"
    );
  });

  it("returns validation_password_match when passwords differ", () => {
    expect(validateRegister({ ...validRegister, confirmPassword: "different1" })).toBe(
      "validation_password_match"
    );
  });
});

describe("validateLogin", () => {
  it("returns null for valid credentials", () => {
    expect(validateLogin("testuser", "password1")).toBeNull();
  });

  it("returns validation_required when username or password is missing", () => {
    expect(validateLogin("", "password1")).toBe("validation_required");
    expect(validateLogin("testuser", "")).toBe("validation_required");
  });

  it("returns validation_username_len for invalid username", () => {
    expect(validateLogin("ab", "password1")).toBe("validation_username_len");
  });

  it("returns validation_password_len for short password", () => {
    expect(validateLogin("testuser", "short")).toBe("validation_password_len");
  });
});
