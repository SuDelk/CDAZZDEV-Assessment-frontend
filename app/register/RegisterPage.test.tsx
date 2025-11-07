import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "@/app/register/page";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import { useRouter } from "next/navigation";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock("@/lib/api", () => ({
  api: jest.fn(),
}));

describe("RegisterPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  it("renders all form inputs", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText("Full name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password")).toBeInTheDocument();
  });

  it("shows error for invalid email", async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Full Name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "invalid-email");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "password123");

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText("Invalid email address")).toBeInTheDocument();
  });

  it("shows error for password mismatch", async () => {
    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Full Name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "wrongpass");

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
  });

  it("calls API and redirects on successful registration", async () => {
    (api as jest.Mock).mockResolvedValue({ status: 201 });

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Full Name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "password123");

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(CONSTANTS.API.AUTH.REGISTER, "POST", {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      })
    );

    expect(push).toHaveBeenCalledWith(CONSTANTS.ROUTES.LOGIN);
  });

  it("shows general error when API fails", async () => {
    (api as jest.Mock).mockRejectedValue(new Error("Server error"));

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Full Name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "password123");

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(
      await screen.findByText(CONSTANTS.MESSAGES.REGISTER_FAIL)
    ).toBeInTheDocument();
  });

  it("shows API message when response not 201", async () => {
    (api as jest.Mock).mockResolvedValue({
      status: 400,
      data: { message: "User already exists" },
    });

    render(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/Full Name/i), "John Doe");
    await userEvent.type(screen.getByLabelText(/Email/i), "john@example.com");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "password123");
    await userEvent.type(screen.getByLabelText(/Confirm Password/i), "password123");

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText("User already exists")).toBeInTheDocument();
  });
});
