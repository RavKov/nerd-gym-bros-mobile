import { Alert } from "react-native";
import axios from "axios";

import { COPY } from "@/src/i18n/copy";
import { alertAxiosError, getErrorMessage, parseApiErrorMessage } from "@/src/utils/apiErrors";

jest.mock("react-native", () => ({
  Alert: { alert: jest.fn() },
}));

jest.mock("@/src/utils/devLog", () => ({
  devWarn: jest.fn(),
}));

describe("parseApiErrorMessage", () => {
  it("reads detail and message from API payloads", () => {
    expect(parseApiErrorMessage({ detail: "Invalid token" })).toBe("Invalid token");
    expect(parseApiErrorMessage({ message: "Not found" })).toBe("Not found");
  });

  it("flattens field validation arrays", () => {
    expect(parseApiErrorMessage({ username: ["Too short"], email: ["Invalid"] })).toBe(
      "username: Too short\nemail: Invalid"
    );
  });

  it("detects HTML error bodies", () => {
    expect(parseApiErrorMessage("<html><body>Error</body></html>")).toContain("HTML response");
  });

  it("truncates long string bodies", () => {
    const long = "x".repeat(250);
    expect(parseApiErrorMessage(long)).toHaveLength(200);
  });

  it("uses fallback for unknown shapes", () => {
    expect(parseApiErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });
});

describe("getErrorMessage", () => {
  it("parses axios error response data", () => {
    const err = new axios.AxiosError("Request failed", "ERR", undefined, undefined, {
      status: 400,
      data: { detail: "Bad request" },
      statusText: "",
      headers: {},
      config: {} as never,
    });

    expect(getErrorMessage(err)).toBe("Bad request");
  });

  it("returns Error message for generic errors", () => {
    expect(getErrorMessage(new Error("Network down"))).toBe("Network down");
  });

  it("uses fallback for unknown values", () => {
    expect(getErrorMessage(42, "Fallback")).toBe("Fallback");
  });
});

describe("alertAxiosError", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows Alert with parsed axios message", () => {
    const err = new axios.AxiosError("fail", "ERR", undefined, undefined, {
      status: 403,
      data: { detail: "Forbidden" },
      statusText: "",
      headers: {},
      config: {} as never,
    });

    alertAxiosError("Access denied", err);

    expect(Alert.alert).toHaveBeenCalledWith("Access denied", "Forbidden");
  });

  it("shows generic message for non-axios errors", () => {
    alertAxiosError("Error", "boom");

    expect(Alert.alert).toHaveBeenCalledWith("Error", COPY.common_unknown_error);
  });
});
