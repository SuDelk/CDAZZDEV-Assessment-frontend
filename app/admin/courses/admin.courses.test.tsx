import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourseManagement from "./page";
import { api } from "@/lib/api";
import Swal from "sweetalert2";

// Mock dependencies
jest.mock("@/lib/api");
jest.mock("sweetalert2");

const mockApi = api as jest.MockedFunction<typeof api>;
const mockSwal = Swal as jest.Mocked<typeof Swal>;

describe("CourseManagement Component", () => {
  const mockCourses = [
    {
      _id: "1",
      title: "React Basics",
      description: "Learn React fundamentals",
      price: 99,
    },
    {
      _id: "2",
      title: "Advanced JavaScript",
      description: "Master JavaScript concepts",
      price: 149,
    },
    {
      _id: "3",
      title: "TypeScript Deep Dive",
      description: "Complete TypeScript guide",
      price: 129,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = "auto";
    
    // Default successful fetch
    mockApi.mockResolvedValue({
      status: 200,
      data: mockCourses,
    });
  });

  afterEach(() => {
    document.body.style.overflow = "auto";
  });

  describe("Initial Rendering and Data Fetching", () => {
    it("should render the component with title and add button", async () => {
      render(<CourseManagement />);
      
      expect(screen.getByText("Course Management")).toBeInTheDocument();
      expect(screen.getByText("Add Course")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search by title...")).toBeInTheDocument();
    });

    it("should fetch and display courses on mount", async () => {
      render(<CourseManagement />);

      await waitFor(() => {
        expect(mockApi).toHaveBeenCalledWith("/courses", "GET");
      });

      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.getByText("Advanced JavaScript")).toBeInTheDocument();
    });

    it("should display error when fetch fails", async () => {
      mockApi.mockRejectedValueOnce(new Error("Network error"));
      mockSwal.fire = jest.fn();

      render(<CourseManagement />);

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith(
          "Error",
          "Failed to fetch courses",
          "error"
        );
      });
    });

    it("should display 'No courses found' when there are no courses", async () => {
      mockApi.mockResolvedValueOnce({
        status: 200,
        data: [],
      });

      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("No courses found.")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should filter courses based on search input", async () => {
      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search by title...");
      fireEvent.change(searchInput, { target: { value: "React" } });

      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.queryByText("Advanced JavaScript")).not.toBeInTheDocument();
    });

    it("should be case-insensitive", async () => {
      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search by title...");
      fireEvent.change(searchInput, { target: { value: "REACT" } });

      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    it("should show 'No courses found' when search has no matches", async () => {
      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search by title...");
      fireEvent.change(searchInput, { target: { value: "Python" } });

      expect(screen.getByText("No courses found.")).toBeInTheDocument();
    });
  });

  describe("Modal Operations", () => {
    it("should open modal when 'Add Course' button is clicked", async () => {
      render(<CourseManagement />);

      const addButton = screen.getByText("Add Course");
      fireEvent.click(addButton);

      expect(screen.getByText("Add Course", { selector: "h2" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter course title")).toBeInTheDocument();
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should close modal when 'Cancel' button is clicked", async () => {
      render(<CourseManagement />);

      fireEvent.click(screen.getByText("Add Course"));
      
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Add Course", { selector: "h2" })).not.toBeInTheDocument();
      });
      expect(document.body.style.overflow).toBe("auto");
    });

    it("should open modal with course data when 'Edit' is clicked", async () => {
      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      expect(screen.getByText("Edit Course")).toBeInTheDocument();
      expect(screen.getByDisplayValue("React Basics")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Learn React fundamentals")).toBeInTheDocument();
      expect(screen.getByDisplayValue("99")).toBeInTheDocument();
    });
  });

  describe("Adding a Course", () => {
    it("should show error when title is empty", async () => {
      render(<CourseManagement />);

      fireEvent.click(screen.getByText("Add Course"));

      const submitButton = screen.getByText("Add Course", { selector: "button[type='submit']" });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });
    });

    it("should show error when price is 0 or negative", async () => {
      const user = userEvent.setup();
      render(<CourseManagement />);

      fireEvent.click(screen.getByText("Add Course"));

      await user.type(screen.getByPlaceholderText("Enter course title"), "Test Course");
      await user.type(screen.getByPlaceholderText("Enter course price"), "0");

      fireEvent.click(screen.getByText("Add Course", { selector: "button[type='submit']" }));

      await waitFor(() => {
        expect(screen.getByText("Price must be greater than 0")).toBeInTheDocument();
      });
    });
  });

  describe("Updating a Course", () => {
    it("should successfully update an existing course", async () => {
      const user = userEvent.setup();
      mockApi
        .mockResolvedValueOnce({ status: 200, data: mockCourses })
        .mockResolvedValueOnce({ status: 200, data: {} })
        .mockResolvedValueOnce({ status: 200, data: mockCourses });

      mockSwal.fire = jest.fn().mockResolvedValue({ isConfirmed: true });

      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText("Edit");
      fireEvent.click(editButtons[0]);

      const titleInput = screen.getByDisplayValue("React Basics");
      await user.clear(titleInput);
      await user.type(titleInput, "Updated React Course");

      fireEvent.click(screen.getByText("Update Course"));

      await waitFor(() => {
        expect(mockApi).toHaveBeenCalledWith("/courses/1", "PUT", {
          _id: "1",
          title: "Updated React Course",
          description: "Learn React fundamentals",
          price: 99,
        });
      });

      expect(mockSwal.fire).toHaveBeenCalledWith(
        "Success",
        "Course updated successfully!",
        "success"
      );
    });
  });

  describe("Deleting a Course", () => {
    it("should delete course when confirmed", async () => {
      mockApi
        .mockResolvedValueOnce({ status: 200, data: mockCourses })
        .mockResolvedValueOnce({ status: 200, data: {} })
        .mockResolvedValueOnce({ status: 200, data: mockCourses.slice(1) });

      mockSwal.fire = jest
        .fn()
        .mockResolvedValueOnce({ isConfirmed: true })
        .mockResolvedValueOnce({});

      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalledWith({
          title: "Are you sure?",
          text: "This will delete the course permanently!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });
      });

      await waitFor(() => {
        expect(mockApi).toHaveBeenCalledWith("/courses/1", "DELETE");
      });

      expect(mockSwal.fire).toHaveBeenCalledWith(
        "Deleted!",
        "Course has been deleted.",
        "success"
      );
    });

    it("should not delete course when cancelled", async () => {
      mockApi.mockResolvedValueOnce({ status: 200, data: mockCourses });
      mockSwal.fire = jest.fn().mockResolvedValueOnce({ isConfirmed: false });

      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockSwal.fire).toHaveBeenCalled();
      });

      expect(mockApi).not.toHaveBeenCalledWith("/courses/1", "DELETE");
    });
  });

  describe("Pagination", () => {
    it("should display pagination when there are more than 4 courses", async () => {
      const manyCourses = Array.from({ length: 10 }, (_, i) => ({
        _id: `${i + 1}`,
        title: `Course ${i + 1}`,
        description: `Description ${i + 1}`,
        price: 100 + i * 10,
      }));

      mockApi.mockResolvedValueOnce({ status: 200, data: manyCourses });

      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("Course 1")).toBeInTheDocument();
      });

      // Check that only 4 courses are displayed
      expect(screen.getByText("Course 1")).toBeInTheDocument();
      expect(screen.getByText("Course 4")).toBeInTheDocument();
      expect(screen.queryByText("Course 5")).not.toBeInTheDocument();
    });

    it("should not display pagination for 4 or fewer courses", async () => {
      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      // Pagination should not be visible
      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("should show loading state when submitting form", async () => {
      const user = userEvent.setup();
      mockApi
        .mockResolvedValueOnce({ status: 200, data: mockCourses })
        .mockImplementationOnce(
          () => new Promise((resolve) => setTimeout(() => resolve({ status: 201, data: {} }), 100))
        );

      render(<CourseManagement />);

      await waitFor(() => {
        expect(screen.getByText("React Basics")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Add Course"));

      await user.type(screen.getByPlaceholderText("Enter course title"), "Test");
      await user.type(screen.getByPlaceholderText("Enter course price"), "100");

      fireEvent.click(screen.getByText("Add Course", { selector: "button[type='submit']" }));

      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });
});