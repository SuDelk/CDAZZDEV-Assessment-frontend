"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // your existing API helper
import Swal from "sweetalert2";
import { Pagination, Stack } from "@mui/material";

interface Course {
  _id?: string;
  title: string;
  description: string;
  price: number;
}

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Course>({
    title: "",
    description: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 4;

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await api("/courses", "GET");
      if (res.status === 200) setCourses(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch courses", "error");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Open modal for add/edit
  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setForm(course);
    } else {
      setEditingCourse(null);
      setForm({ title: "", description: "", price: 0 });
    }
    setError("");
    setIsModalOpen(true);
    document.body.style.overflow = "hidden"; // prevent background scroll
  };

  const closeModal = () => {
    setEditingCourse(null);
    setForm({ title: "", description: "", price: 0 });
    setError("");
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  // Handle create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.title.trim()) return setError("Title is required");
    if (form.price <= 0) return setError("Price must be greater than 0");

    try {
      let res;
      if (editingCourse?._id) {
        res = await api(`/courses/${editingCourse._id}`, "PUT", form);
      } else {
        res = await api("/courses", "POST", form);
      }

      if (res.status === 200 || res.status === 201) {
        Swal.fire(
          "Success",
          editingCourse
            ? "Course updated successfully!"
            : "Course added successfully!",
          "success"
        );
        fetchCourses();
        closeModal();
      } else {
        setError(res.data?.message || "Error saving course");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the course permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await api(`/courses/${id}`, "DELETE");
        if (res.status === 200) {
          Swal.fire("Deleted!", "Course has been deleted.", "success");
          fetchCourses();
        } else {
          Swal.fire(
            "Error",
            res.data?.message || "Failed to delete course",
            "error"
          );
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Network error", "error");
      }
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  const getButtonLabel = () => {
    if (loading) return "Saving...";
    if (editingCourse) return "Update Course";
    return "Add Course";
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Course Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Course
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Course List */}
      <div className="space-y-3">
        {currentCourses.length === 0 ? (
          <p className="text-gray-500">No courses found.</p>
        ) : (
          currentCourses.map((course) => (
            <div
              key={course._id}
              className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
            >
              <div>
                <p className="font-semibold">{course.title}</p>
                <p className="text-sm text-gray-500">{course.description}</p>
                <p className="text-sm font-medium text-blue-600">
                  ${course.price}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(course)}
                  className="text-sm text-black bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack
          spacing={2}
          className="flex justify-center mt-4 w-max mx-auto"
          sx={{
            "& .MuiPaginationItem-root": {
              color: "#1ae",
            },
            "& .Mui-selected": {
              backgroundColor: "#1ae",
              color: "#fff",
            },
            "& .MuiPaginationItem-previousNext": {
              color: "#1abe",
            },
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            size="small"
          />
        </Stack>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg w-2/3 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingCourse ? "Edit Course" : "Add Course"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label htmlFor="title" className="mb-1 font-medium">
                  Course Title
                </label>
                <input
                  name="title"
                  placeholder="Enter course title"
                  value={form.title}
                  onChange={handleChange}
                  className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="description" className="mb-1 font-medium">
                  Course Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter course description"
                  value={form.description}
                  onChange={handleChange}
                  className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="price" className="mb-1 font-medium">
                  Course Price ($)
                </label>
                <input
                  name="price"
                  type="number"
                  placeholder="Enter course price"
                  value={form.price === 0 ? "" : form.price}
                  onChange={handleChange}
                  className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 
                   appearance-none [&::-webkit-outer-spin-button]:appearance-none 
                   [&::-webkit-inner-spin-button]:appearance-none 
                   [&::-moz-appearance]:textfield"
                />
              </div>

              {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {getButtonLabel()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
