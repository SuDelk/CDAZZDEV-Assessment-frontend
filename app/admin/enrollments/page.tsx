"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import Swal from "sweetalert2";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

interface Enrollment {
  _id: string;
  userId: { _id: string; name: string; email: string };
  courseId: { _id: string; title: string };
  status: "active" | "completed";
}

interface EnrollmentForm {
  userId: string;
  courseId: string;
  status: "active" | "completed";
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
}

export default function EnrollStudentPage() {
  const [form, setForm] = useState<EnrollmentForm>({
    userId: "",
    courseId: "",
    status: "active",
  });
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  const [filterStudent, setFilterStudent] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "completed">(
    ""
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const studentRef = useRef<HTMLDivElement>(null);
  const courseRef = useRef<HTMLDivElement>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
        api(CONSTANTS.API.USERS.ALL),
        api(CONSTANTS.API.COURSES.ALL),
        api(CONSTANTS.API.ENROLLMENTS.ALL),
      ]);

      setStudents(
        usersRes.data?.filter((u: User) => u.role === "student") || []
      );
      setCourses(coursesRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        studentRef.current &&
        !studentRef.current.contains(e.target as Node)
      ) {
        setShowStudentDropdown(false);
      }
      if (courseRef.current && !courseRef.current.contains(e.target as Node)) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.courseId) {
      Swal.fire("Warning", "Please select both student and course", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.CREATE, "POST", form);
      if (res.status === 201) {
        Swal.fire("Success", "Student enrolled successfully!", "success");
        setForm({ userId: "", courseId: "", status: "active" });
        setStudentSearch("");
        setCourseSearch("");
        setModalOpen(false);
        fetchAllData();
      } else {
        Swal.fire(
          "Error",
          res.data?.message || "Failed to enroll student",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error enrolling student", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, status: "active" | "completed") => {
    const confirmed = await Swal.fire({
      title: "Change Enrollment Status?",
      text: "Are you sure you want to update this enrollment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.UPDATE(id), "PUT", {
        status,
      });
      if (res.status === 200) {
        Swal.fire("Success", "Enrollment updated successfully", "success");
        fetchAllData();
      } else {
        Swal.fire("Error", res.data?.message || "Failed to update", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error updating enrollment", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await Swal.fire({
      title: "Delete Enrollment?",
      text: "Are you sure you want to delete this enrollment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.DELETE(id), "DELETE");
      if (res.status === 200) {
        Swal.fire("Deleted!", "Enrollment deleted successfully", "success");
        fetchAllData();
      } else {
        Swal.fire("Error", res.data?.message || "Failed to delete", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error deleting enrollment", "error");
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchesStudent = e.userId.name
      .toLowerCase()
      .includes(filterStudent.toLowerCase());
    const matchesCourse = e.courseId.title
      .toLowerCase()
      .includes(filterCourse.toLowerCase());
    const matchesStatus = filterStatus ? e.status === filterStatus : true;
    return matchesStudent && matchesCourse && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleStudentSelect = (student: User) => {
    setForm({ ...form, userId: student._id });
    setStudentSearch(student.name);
    setShowStudentDropdown(false);
  };

  const handleCourseSelect = (course: Course) => {
    setForm({ ...form, courseId: course._id });
    setCourseSearch(course.title);
    setShowCourseDropdown(false);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600">Enrollments</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Enrollment
        </button>
      </div>

      {/* Filters in one line */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Filter by student..."
          value={filterStudent}
          onChange={(e) => {
            setFilterStudent(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded flex-1 min-w-[150px]"
        />

        <input
          type="text"
          placeholder="Filter by course..."
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            setCurrentPage(1);
          }}
          className="border p-2 rounded flex-1 min-w-[150px]"
        />

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as "" | "active" | "completed");
            setCurrentPage(1);
          }}
          className="border p-2 rounded flex-1 min-w-[120px]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Enrollment Table */}
      <div className="overflow-x-auto">
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {!loading && filteredEnrollments.length === 0 && (
          <p className="text-center text-gray-500">No enrollments found</p>
        )}
        {!loading && filteredEnrollments.length > 0 && (
          <>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2 border border-gray-300 dark:border-gray-700">
                    Student
                  </th>
                  <th className="p-2 border border-gray-300 dark:border-gray-700">
                    Course
                  </th>
                  <th className="p-2 border border-gray-300 dark:border-gray-700">
                    Status
                  </th>
                  <th className="p-2 border border-gray-300 dark:border-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEnrollments.map((enroll) => (
                  <tr
                    key={enroll._id}
                    className="text-center hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                  >
                    <td className="p-2 border border-gray-300 dark:border-gray-700">
                      {enroll.userId.name} <br />
                      <span className="text-xs text-gray-500">
                        {enroll.userId.email}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">
                      {enroll.courseId.title}
                    </td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700 capitalize">
                      {enroll.status}
                    </td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700 space-x-2">
                      <button
                        onClick={() =>
                          handleUpdate(
                            enroll._id,
                            enroll.status === "active" ? "completed" : "active"
                          )
                        }
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded text-sm"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={() => handleDelete(enroll._id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
          </>
        )}
      </div>

      {/* Enrollment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex justify-center items-start z-50 pt-30 overflow-auto">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg w-2/3 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Enroll Student
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Student Dropdown */}
              <div className="relative" ref={studentRef}>
                <label className="block text-sm font-medium mb-1">
                  Student
                </label>
                <input
                  type="text"
                  placeholder="Type student name..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="border border-gray-300 text-black bg-white p-2 w-full rounded focus:ring-2 focus:ring-blue-500"
                />
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <ul className="absolute z-50 w-full max-h-40 overflow-auto border border-gray-300 bg-white rounded mt-1 shadow-lg text-black">
                    {filteredStudents.map((student) => (
                      <li
                        key={student._id}
                        onClick={() => handleStudentSelect(student)}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {student.name} ({student.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Course Dropdown */}
              <div className="relative" ref={courseRef}>
                <label className="block text-sm font-medium mb-1">Course</label>
                <input
                  type="text"
                  placeholder="Type course title..."
                  value={courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setShowCourseDropdown(true);
                  }}
                  onFocus={() => setShowCourseDropdown(true)}
                  className="border border-gray-300 text-black bg-white p-2 w-full rounded focus:ring-2 focus:ring-blue-500"
                />
                {showCourseDropdown && filteredCourses.length > 0 && (
                  <ul className="absolute z-50 w-full max-h-40 overflow-auto border border-gray-300 bg-white rounded mt-1 shadow-lg text-black">
                    {filteredCourses.map((course) => (
                      <li
                        key={course._id}
                        onClick={() => handleCourseSelect(course)}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                      >
                        {course.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Status */}
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "active" | "completed",
                  })
                }
                className="border border-gray-300 text-black bg-white p-2 mb-4 w-full rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex justify-between gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                >
                  {submitting ? "Enrolling..." : "Enroll Student"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded"
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
