/**
 * Smoke test: LoginForm renders title and submit button.
 * UI layer — no deep interaction testing (covered by Playwright E2E).
 */
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./login-form";

// Mock the server action — not callable in test environment
vi.mock("@/app/actions/auth", () => ({
  signInAction: vi.fn(),
}));

describe("LoginForm smoke test", () => {
  it("renders the submit button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });
});
