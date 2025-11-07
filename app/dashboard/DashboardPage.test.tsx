import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import Swal from "sweetalert2";
import { api } from "@/lib/api";

// 🧩 Mocks
jest.mock("@/lib/api");
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (api as jest.Mock).mockResolvedValueOnce({});
    render(<DashboardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows 'Student not found' if API returns null", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ data: { user: null } });
    render(<DashboardPage />);
    await waitFor(() =>
      expect(screen.getByText(/student not found/i)).toBeInTheDocument()
    );
  });

  it("renders student info and enrolled courses", async () => {
    const mockStudent = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      coursesEnrolled: [
        { _id: "c1", title: "Math 101", description: "Basics", price: 50 },
        { _id: "c2", title: "Science 101", description: "Intro", price: 75 },
      ],
    };
    (api as jest.Mock).mockResolvedValueOnce({ data: { user: mockStudent } });

    render(<DashboardPage />);

    expect(await screen.findByText(/John Doe's Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Math 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Science 101/i)).toBeInTheDocument();
  });

  it("shows message when no enrolled courses", async () => {
    const mockStudent = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      coursesEnrolled: [],
    };
    (api as jest.Mock).mockResolvedValueOnce({ data: { user: mockStudent } });

    render(<DashboardPage />);
    expect(
      await screen.findByText(/You are not enrolled in any courses/i)
    ).toBeInTheDocument();
  });

  it("handles unenroll confirmation and updates list", async () => {
    const mockStudent = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      coursesEnrolled: [
        { _id: "c1", title: "Math 101", description: "Basics", price: 50 },
      ],
    };

    (api as jest.Mock)
      // Initial profile
      .mockResolvedValueOnce({ data: { user: mockStudent } })
      // Mock enrollment list API
      .mockResolvedValueOnce({
        data: [
          { _id: "enroll1", userId: { _id: "123" }, courseId: { _id: "c1" } },
        ],
      })
      // Mock DELETE unenrollment API
      .mockResolvedValueOnce({ status: 200 });

    (Swal.fire as jest.Mock)
      // Confirmation popup
      .mockResolvedValueOnce({ isConfirmed: true })
      // Success popup
      .mockResolvedValueOnce({});

    render(<DashboardPage />);

    // Wait for course to appear
    await screen.findByText(/Math 101/i);

    // Click Unenroll
    fireEvent.click(screen.getByRole("button", { name: /unenroll/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Are you sure?",
        })
      );
    });

    // Verify unenroll API called and UI updated
    await waitFor(() => {
      expect(screen.queryByText(/Math 101/i)).not.toBeInTheDocument();
    });
  });

  it("does not unenroll if confirmation cancelled", async () => {
    const mockStudent = {
      _id: "123",
      name: "John Doe",
      email: "john@example.com",
      coursesEnrolled: [
        { _id: "c1", title: "Math 101", description: "Basics", price: 50 },
      ],
    };
    (api as jest.Mock).mockResolvedValueOnce({ data: { user: mockStudent } });
    (Swal.fire as jest.Mock).mockResolvedValueOnce({ isConfirmed: false });

    render(<DashboardPage />);
    await screen.findByText(/Math 101/i);

    fireEvent.click(screen.getByRole("button", { name: /unenroll/i }));

    await waitFor(() => {
      expect(api).toHaveBeenCalledTimes(1); // only profile fetch
    });
  });
});
