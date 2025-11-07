"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import Swal from "sweetalert2";
import { Pagination, Stack } from "@mui/material";

interface Course {
  _id: string;
  title: string;
  price: number;
  description?: string;
  duration?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  coursesEnrolled: Course[];
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [errors, setErrors] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [coursesModalOpen, setCoursesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api(CONSTANTS.API.USERS.ALL_STUDENTS);
      if (res.status === 200) {
        setStudents(res.data || []);
        setFilteredStudents(res.data || []);
      } else Swal.fire("Error", "Failed to load students", "error");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error fetching students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Search filter
  useEffect(() => {
    if (!searchQuery) setFilteredStudents(students);
    else
      setFilteredStudents(
        students.filter((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    setCurrentPage(1);
  }, [searchQuery, students]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Form validation
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email.";
    if (!editing) {
      if (!formData.password) newErrors.password = "Password is required.";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const endpoint = editing
        ? CONSTANTS.API.USERS.BY_ID(selectedStudent!._id)
        : CONSTANTS.API.AUTH.REGISTER;
      const method = editing ? "PUT" : "POST";
      const payload = editing
        ? { name: formData.name, email: formData.email, role: formData.role }
        : { ...formData };

      const res = await api(endpoint, method, payload);
      if (res.status === 200 || res.status === 201) {
        Swal.fire(
          "Success",
          `Student ${editing ? "updated" : "created"} successfully!`,
          "success"
        );
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student",
        });
        setEditing(false);
        setSelectedStudent(null);
        setModalOpen(false);
        fetchStudents();
      } else {
        Swal.fire(
          "Error",
          res.data?.message || "Failed to save student",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error saving student", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      password: "",
      confirmPassword: "",
      role: student.role,
    });
    setEditing(true);
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the student permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (confirmed.isConfirmed) {
      const res = await api(CONSTANTS.API.USERS.BY_ID(id), "DELETE");
      if (res.status === 200)
        Swal.fire("Deleted!", "Student deleted", "success");
      else Swal.fire("Error", "Failed to delete student", "error");
      fetchStudents();
    }
  };

  const handleUnenroll = async (studentId: string, courseId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unenroll from this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unenroll",
    });

    if (!result.isConfirmed) return;

    try {
      const allEnrollments = await api(CONSTANTS.API.ENROLLMENTS.ALL);
      const enrollment = allEnrollments.data.find(
        (e: any) => e.userId._id === studentId && e.courseId._id === courseId
      );
      if (!enrollment) {
        Swal.fire("Error", "Enrollment not found", "error");
        return;
      }

      const res = await api(
        CONSTANTS.API.ENROLLMENTS.DELETE(enrollment._id),
        "DELETE"
      );
      if (res.status === 200) {
        Swal.fire("Unenrolled!", "Student removed from course.", "success");
        setSelectedStudent((prev) =>
          prev
            ? {
                ...prev,
                coursesEnrolled: prev.coursesEnrolled.filter(
                  (c) => c._id !== courseId
                ),
              }
            : null
        );
        setStudents((prev) =>
          prev.map((s) =>
            s._id === studentId
              ? {
                  ...s,
                  coursesEnrolled: s.coursesEnrolled.filter(
                    (c) => c._id !== courseId
                  ),
                }
              : s
          )
        );
      } else {
        Swal.fire("Error", res.data?.message || "Failed to unenroll", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to unenroll", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          🎓 Student Management
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Student / Admin
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-zinc-800">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Courses</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Loading students...
                </td>
              </tr>
            ) : currentStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  No students found
                </td>
              </tr>
            ) : (
              currentStudents.map((s) => (
                <tr
                  key={s._id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                >
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.email}</td>
                  <td className="p-2 capitalize">{s.role}</td>
                  <td className="p-2">{s.coursesEnrolled.length}</td>
                  <td className="p-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setCoursesModalOpen(true);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded"
                    >
                      View Courses
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

      {/* Courses Modal */}
      {coursesModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center z-50 pt-20 overflow-auto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg w-[95%] max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-center">
              {selectedStudent.name}'s Courses
            </h2>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {selectedStudent.coursesEnrolled.map((c) => (
                <li
                  key={c._id}
                  className="flex justify-between items-center border p-2 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                >
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm">Price: ${c.price}</p>
                    {c.description && (
                      <p className="text-sm">{c.description}</p>
                    )}
                    {c.duration && (
                      <p className="text-sm">Duration: {c.duration}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleUnenroll(selectedStudent._id, c._id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded"
                  >
                    Unenroll
                  </button>
                </li>
              ))}
            </ul>
            <div className="text-center mt-4">
              <button
                onClick={() => setCoursesModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 bg-opacity-40 flex items-start justify-center z-50 pt-30 overflow-auto">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg w-[95%] max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editing ? "Update Student" : "Add New Student / Admin"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}

              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}

              {!editing && (
                <>
                  <input
                    placeholder="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}

                  <input
                    placeholder="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="border p-2 rounded w-full"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </>
              )}

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                <option value="student" className="text-blue-950">Student</option>
                <option value="admin" className="text-blue-950">Admin</option>
              </select>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {editing ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditing(false);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      role: "student",
                    });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
