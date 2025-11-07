import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CoursesPage from "@/app/courses/page";
import Swal from "sweetalert2";

jest.mock("sweetalert2", () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

jest.mock("@/lib/api", () => ({
  api: jest.fn(),
}));

jest.mock("@/lib/constants", () => ({
  CONSTANTS: {
    API: {
      USERS: { PROFILE: "/api/user/profile" },
      COURSES: { ALL: "/api/courses" },
      ENROLLMENTS: {
        CREATE: "/api/enrollments",
        ALL: "/api/enrollments/all",
        DELETE: (id: string) => `/api/enrollments/${id}`,
      },
    },
  },
}));

const mockApi = require("@/lib/api").api;

describe("CoursesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders list of courses", async () => {
    mockApi
      .mockResolvedValueOnce({
        data: { user: { _id: "u1", coursesEnrolled: [] } },
      }) // PROFILE
      .mockResolvedValueOnce({
        data: [
          { _id: "1", title: "React 101", description: "Learn React", price: 99 },
          { _id: "2", title: "Next.js Basics", description: "Server-side magic", price: 120 },
        ],
      }); // COURSES

    await act(async () => {
      render(<CoursesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("React 101")).toBeInTheDocument();
      expect(screen.getByText("Next.js Basics")).toBeInTheDocument();
    });
  });

  // Same wrapping pattern for other tests
  it("enrolls in a course when Enroll clicked", async () => {
    mockApi
      .mockResolvedValueOnce({
        data: { user: { _id: "u1", coursesEnrolled: [] } },
      })
      .mockResolvedValueOnce({
        data: [{ _id: "1", title: "React 101", description: "Learn React", price: 99 }],
      })
      .mockResolvedValueOnce({ status: 201 });

    await act(async () => {
      render(<CoursesPage />);
    });

    await waitFor(() => screen.getByText("React 101"));
    fireEvent.click(screen.getByRole("button", { name: /enroll/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Enrolled!",
        "You have successfully enrolled in this course.",
        "success"
      );
    });
  });
});
