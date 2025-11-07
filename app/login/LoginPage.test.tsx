import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows error messages if fields are empty", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid email", async () => {
    render(<LoginPage />);
    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/password/i);

    await userEvent.type(email, "invalidemail");
    await userEvent.type(password, "password123");
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it("clears error when typing after invalid input", async () => {
    render(<LoginPage />);
    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/password/i);
    const button = screen.getByRole("button", { name: /sign in/i });

    // Trigger invalid email first
    await userEvent.type(email, "invalidemail");
    await userEvent.type(password, "password123");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    // Clear and type valid email
    await userEvent.clear(email);
    await userEvent.type(email, "valid@example.com");

    await waitFor(() => {
      expect(
        screen.queryByText(/invalid email address/i)
      ).not.toBeInTheDocument();
    });
  });

  it("disables the button while loading", async () => {
    render(<LoginPage />);
    const button = screen.getByRole("button", { name: /Sign In/i });

    userEvent.type(screen.getByPlaceholderText(/Email/i), "test@example.com");
    userEvent.type(screen.getByPlaceholderText(/Password/i), "password123");

    fireEvent.click(button);

    // Expect button to disable immediately
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });
});
