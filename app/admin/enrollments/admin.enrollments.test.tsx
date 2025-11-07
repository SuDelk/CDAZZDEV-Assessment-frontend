import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EnrollStudentPage from "@/app/admin/enrollments/page";
import Swal from "sweetalert2";
import { api } from "@/lib/api";

jest.mock("sweetalert2", () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

jest.mock("@/lib/api", () => ({
  api: jest.fn(),
}));

jest.mock("@/lib/constants", () => ({
  CONSTANTS: {
    API: {
      USERS: { ALL: "/users" },
      COURSES: { ALL: "/courses" },
      ENROLLMENTS: {
        ALL: "/enrollments",
        CREATE: "/enrollments/create",
        UPDATE: (id: string) => `/enrollments/${id}`,
        DELETE: (id: string) => `/enrollments/${id}`,
      },
    },
  },
}));

const mockStudents = [
  { _id: "s1", name: "John Doe", email: "john@example.com", role: "student" },
];
const mockCourses = [{ _id: "c1", title: "Math 101" }];
const mockEnrollments = [
  {
    _id: "e1",
    userId: { _id: "s1", name: "John Doe", email: "john@example.com" },
    courseId: { _id: "c1", title: "Math 101" },
    status: "active",
  },
];

describe("EnrollStudentPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api as jest.Mock).mockImplementation((url, method) => {
      if (url === "/users") return Promise.resolve({ data: mockStudents });
      if (url === "/courses") return Promise.resolve({ data: mockCourses });
      if (url === "/enrollments") return Promise.resolve({ data: mockEnrollments });
      if (url.includes("/create"))
        return Promise.resolve({ status: 201, data: {} });
      if (url.includes("/enrollments/") && method === "PUT")
        return Promise.resolve({ status: 200, data: {} });
      if (url.includes("/enrollments/") && method === "DELETE")
        return Promise.resolve({ status: 200, data: {} });
      return Promise.resolve({ data: [] });
    });
  });

  it("renders the page and fetches data", async () => {
    render(<EnrollStudentPage />);
    await waitFor(() => {
      expect(api).toHaveBeenCalledWith("/users");
      expect(screen.getByText(/Enrollments/i)).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("shows 'No enrollments found' if empty", async () => {
    (api as jest.Mock).mockImplementation((url) => {
      if (url === "/users") return Promise.resolve({ data: mockStudents });
      if (url === "/courses") return Promise.resolve({ data: mockCourses });
      if (url === "/enrollments") return Promise.resolve({ data: [] });
    });
    render(<EnrollStudentPage />);
    await waitFor(() =>
      expect(screen.getByText(/No enrollments found/i)).toBeInTheDocument()
    );
  });

  it("shows validation error if fields are empty", async () => {
    render(<EnrollStudentPage />);
    fireEvent.click(screen.getByText("Add New Enrollment"));
    const submitBtn = screen.getByRole("button", { name: /Enroll Student/i });
    fireEvent.click(submitBtn);
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        "Warning",
        "Please select both student and course",
        "warning"
      )
    );
  });

  it("updates enrollment successfully", async () => {
    render(<EnrollStudentPage />);
    await waitFor(() => screen.getByText(/Change Status/i));
    fireEvent.click(screen.getByText(/Change Status/i));
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Change Enrollment Status?",
        })
      )
    );
  });

  it("deletes enrollment successfully", async () => {
    render(<EnrollStudentPage />);
    await waitFor(() => screen.getByText(/Delete/i));
    fireEvent.click(screen.getByText(/Delete/i));
    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Delete Enrollment?",
        })
      )
    );
  });

  it("filters enrollments by student", async () => {
    render(<EnrollStudentPage />);
    await waitFor(() => screen.getByPlaceholderText(/Filter by student/i));
    const studentFilter = screen.getByPlaceholderText(/Filter by student/i);
    fireEvent.change(studentFilter, { target: { value: "Jane" } });
    await waitFor(() =>
      expect(screen.getByText(/No enrollments found/i)).toBeInTheDocument()
    );
  });
});
