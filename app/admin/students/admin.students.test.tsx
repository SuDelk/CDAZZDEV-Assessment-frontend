import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentManagement from "./page";
import Swal from "sweetalert2";
import { api } from "@/lib/api";

jest.mock("sweetalert2");
jest.mock("@/lib/api", () => ({
  api: jest.fn(),
}));

const mockStudents = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    coursesEnrolled: [
      { _id: "c1", title: "React Basics", price: 100 },
      { _id: "c2", title: "Node.js Advanced", price: 200 },
    ],
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "student",
    coursesEnrolled: [],
  },
];

describe("StudentManagement Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Swal mock to default behavior
    (Swal.fire as jest.Mock).mockResolvedValue({ isConfirmed: false });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (api as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<StudentManagement />);
    expect(screen.getByText(/Loading students/i)).toBeInTheDocument();
  });

  it("renders students after data fetch", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: mockStudents 
    });
    
    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  it("shows 'No students found' when list is empty", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: [] 
    });
    
    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/No students found/i)).toBeInTheDocument();
    });
  });

  it("handles API error on fetch", async () => {
    (api as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    (Swal.fire as jest.Mock).mockResolvedValueOnce({});
    
    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Error",
        expect.any(String),
        "error"
      );
    });
  });

  it("filters students by search", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: mockStudents 
    });
    
    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(search, { target: { value: "Jane" } });

    await waitFor(() => {
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
    });
  });

  it("shows no results when search doesn't match", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: mockStudents 
    });
    
    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(search, { target: { value: "Nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText(/No students found/i)).toBeInTheDocument();
    });
  });

  it("opens modal when 'Add New Student' is clicked", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: [] 
    });
    
    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading students/i)).not.toBeInTheDocument();
    });

    const addButton = screen.getByText(/Add New Student/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    });
  });

  it("shows validation errors when creating a student with empty fields", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: [] 
    });
    
    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading students/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add New Student/i));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
  });

  it("shows error for invalid email format", async () => {
    const user = userEvent.setup();
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: [] 
    });
    
    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading students/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add New Student/i));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Full Name/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/^Password$/i);
    
    await user.type(nameInput, "Test User");
    await user.type(emailInput, "invalidemail");
    await user.type(passwordInput, "password123");

    const createButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows error for password mismatch", async () => {
    const user = userEvent.setup();
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: [] 
    });
    
    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading students/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add New Student/i));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/Full Name/i), "Test User");
    await user.type(screen.getByPlaceholderText(/Email/i), "test@example.com");
    await user.type(screen.getByPlaceholderText(/^Password$/i), "pass1");
    await user.type(screen.getByPlaceholderText(/Confirm Password/i), "pass2");

    const createButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("creates a student successfully", async () => {
    const user = userEvent.setup();
    (api as jest.Mock)
      .mockResolvedValueOnce({ status: 200, data: [] }) // initial fetch
      .mockResolvedValueOnce({ status: 201, data: {} }) // POST create
      .mockResolvedValueOnce({ status: 200, data: mockStudents }); // refetch after create

    (Swal.fire as jest.Mock).mockResolvedValueOnce({});

    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading students/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add New Student/i));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/Full Name/i), "Alice");
    await user.type(screen.getByPlaceholderText(/Email/i), "alice@example.com");
    await user.type(screen.getByPlaceholderText(/^Password$/i), "123456");
    await user.type(screen.getByPlaceholderText(/Confirm Password/i), "123456");

    const createButton = screen.getByRole("button", { name: /Create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith(
        "/users/register",
        "POST",
        expect.objectContaining({
          name: "Alice",
          email: "alice@example.com",
          role: "student",
        })
      );
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Success",
        "Student created successfully!",
        "success"
      );
    });
  });

  it("handles edit student flow", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: mockStudents 
    });

    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
  });

  it("updates student successfully", async () => {
    const user = userEvent.setup();
    (api as jest.Mock)
      .mockResolvedValueOnce({ status: 200, data: mockStudents }) // initial fetch
      .mockResolvedValueOnce({ status: 200, data: {} }) // PUT update
      .mockResolvedValueOnce({ status: 200, data: mockStudents }); // refetch

    (Swal.fire as jest.Mock).mockResolvedValueOnce({});

    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("John Doe");
    await user.clear(nameInput);
    await user.type(nameInput, "John Updated");

    const updateButton = screen.getByRole("button", { name: /Update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith(
        "/users/1",
        "PUT",
        expect.objectContaining({
          name: "John Updated",
        })
      );
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Success",
        expect.stringContaining("updated"),
        "success"
      );
    });
  });

  it("deletes student after confirmation", async () => {
    (api as jest.Mock)
      .mockResolvedValueOnce({ status: 200, data: mockStudents }) // initial fetch
      .mockResolvedValueOnce({ status: 200, data: {} }) // DELETE success
      .mockResolvedValueOnce({ status: 200, data: mockStudents.slice(1) }); // refetch

    (Swal.fire as jest.Mock)
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmation
      .mockResolvedValueOnce({}); // success message

    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ 
          title: "Are you sure?",
          icon: "warning"
        })
      );
    });

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith("/users/1", "DELETE");
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Deleted!",
        expect.any(String),
        "success"
      );
    });
  });

  it("does not delete student when cancelled", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: mockStudents 
    });

    (Swal.fire as jest.Mock).mockResolvedValueOnce({ isConfirmed: false });

    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalled();
    });

    // Ensure DELETE was NOT called
    expect(api).not.toHaveBeenCalledWith("/users/1", "DELETE");
  });

  it("handles view courses flow", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: mockStudents 
    });

    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const viewCoursesButtons = screen.getAllByText(/View Courses/i);
    fireEvent.click(viewCoursesButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/React Basics/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Node.js Advanced/i)).toBeInTheDocument();
  });

  it("handles unenroll flow successfully", async () => {
    (api as jest.Mock)
      .mockResolvedValueOnce({ status: 200, data: mockStudents }) // fetch students
      .mockResolvedValueOnce({
        status: 200,
        data: [
          { 
            _id: "en1", 
            userId: { _id: "1", name: "John Doe" }, 
            courseId: { _id: "c1", title: "React Basics" } 
          },
          { 
            _id: "en2", 
            userId: { _id: "1", name: "John Doe" }, 
            courseId: { _id: "c2", title: "Node.js Advanced" } 
          },
        ],
      }) // get enrollments
      .mockResolvedValueOnce({ status: 200, data: {} }) // DELETE enrollment
      .mockResolvedValueOnce({ status: 200, data: mockStudents }); // refetch students

    (Swal.fire as jest.Mock)
      .mockResolvedValueOnce({ isConfirmed: true }) // confirmation
      .mockResolvedValueOnce({}); // success popup

    render(<StudentManagement />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const viewCoursesButtons = screen.getAllByText(/View Courses/i);
    fireEvent.click(viewCoursesButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/React Basics/i)).toBeInTheDocument();
    });

    const unenrollButtons = screen.getAllByText(/Unenroll/i);
    fireEvent.click(unenrollButtons[0]);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Are you sure?",
          text: expect.stringContaining("unenroll"),
        })
      );
    });

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith("/enrollments/en1", "DELETE");
    });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Unenrolled!",
        expect.any(String),
        "success"
      );
    });
  });

  it("closes modal when cancel is clicked", async () => {
    (api as jest.Mock).mockResolvedValueOnce({ 
      status: 200, 
      data: [] 
    });
    
    render(<StudentManagement />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading students/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Add New Student/i));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Full Name/i)).not.toBeInTheDocument();
    });
  });
});