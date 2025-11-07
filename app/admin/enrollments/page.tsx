"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";

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

  // 🧠 Fetch all students, courses, and enrollments
  async function fetchAllData() {
    setLoading(true);
    try {
      const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
        api(CONSTANTS.API.USERS.ALL),
        api(CONSTANTS.API.COURSES.ALL),
        api(CONSTANTS.API.ENROLLMENTS.ALL),
      ]);

      setStudents(
        usersRes.data?.filter((u: User) => u?.role === "student") || []
      );
      setCourses(coursesRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  // 🧾 Submit new enrollment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.courseId) {
      alert("Please select both student and course");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.CREATE, "POST", form);
      if (res.status === 201) {
        alert("✅ Student enrolled successfully!");
        setForm({ userId: "", courseId: "", status: "active" });
        fetchAllData();
      } else {
        alert(res.data?.message || "Failed to enroll student");
      }
    } catch (error) {
      console.error(error);
      alert("Error enrolling student");
    } finally {
      setSubmitting(false);
    }
  };

  // ✏️ Update enrollment status
  const handleUpdate = async (id: string, status: "active" | "completed") => {
    if (!confirm("Are you sure you want to update this enrollment?")) return;
    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.UPDATE(id), "PUT", {
        status,
      });
      if (res.status === 200) {
        alert("✅ Enrollment updated successfully");
        fetchAllData();
      } else {
        alert(res.data?.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating enrollment");
    }
  };

  // 🗑️ Delete enrollment
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enrollment?")) return;
    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.DELETE(id), "DELETE");
      if (res.status === 200) {
        alert("🗑️ Enrollment deleted");
        fetchAllData();
      } else {
        alert(res.data?.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting enrollment");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4 transition-colors duration-300">
      {/* Enrollment Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-(--color-background) text-(--color-foreground) border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-lg w-[90%] sm:w-96 mb-10 transition-all duration-300"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Enroll Student</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <>
            {/* Student Selection */}
            <label htmlFor="userId" className="block text-sm font-medium mb-1">
              Select Student
            </label>
            <select
              name="userId"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
              className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground p-2 mb-4 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Student --</option>
              {students.map((student) => (
                <option
                  key={student._id}
                  value={student._id}
                  className="text-black"
                >
                  {student.name} ({student.email})
                </option>
              ))}
            </select>

            {/* Course Selection */}
            <label
              htmlFor="courseId"
              className="block text-sm font-medium mb-1"
            >
              Select Course
            </label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              required
              className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground p-2 mb-4 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Course --</option>
              {courses.map((course) => (
                <option
                  key={course._id}
                  value={course._id}
                  className="text-black"
                >
                  {course.title}
                </option>
              ))}
            </select>

            {/* Status */}
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "active" | "completed",
                })
              }
              className="border border-gray-300 dark:border-gray-600 bg-transparent text-foreground p-2 mb-6 w-full rounded outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active" className="text-black">
                Active
              </option>
              <option value="completed" className="text-black">
                Completed
              </option>
            </select>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors duration-200 disabled:opacity-60"
            >
              {submitting ? "Enrolling..." : "Enroll Student"}
            </button>
          </>
        )}
      </form>

      {/* Enrollment Table */}
      <div className="w-full max-w-4xl bg-(--color-background) border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4 text-center">
          All Enrollments
        </h3>

        {/* ✅ Extracted nested ternary into a separate renderContent variable */}
        {(() => {
          if (loading) {
            return <p className="text-center text-gray-500">Loading...</p>;
          }

          if (enrollments.length === 0) {
            return (
              <p className="text-center text-gray-500">No enrollments found</p>
            );
          }

          return (
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
                {enrollments.map((enroll) => (
                  <tr key={enroll._id} className="text-center">
                    <td className="p-2 border border-gray-300 dark:border-gray-700">
                      {enroll.userId?.name} <br />
                      <span className="text-xs text-gray-500">
                        {enroll.userId?.email}
                      </span>
                    </td>
                    <td className="p-2 border border-gray-300 dark:border-gray-700">
                      {enroll.courseId?.title}
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
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Change Status
                      </button>
                      <button
                        onClick={() => handleDelete(enroll._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );
}
