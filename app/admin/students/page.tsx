"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  coursesEnrolled: { _id: string; title: string; price: number }[];
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [errors, setErrors] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🧠 Fetch all students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api(CONSTANTS.API.USERS.ALL_STUDENTS);
      if (res.status === 200) setStudents(res.data || []);
      else alert("Failed to load students");
    } catch (err) {
      console.error(err);
      alert("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Form Validation
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email.";
    if (!editing && !formData.password)
      newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Create / Update Student
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const endpoint = editing
        ? CONSTANTS.API.USERS.BY_ID(selectedStudent!._id)
        : CONSTANTS.API.AUTH.REGISTER;

      const method = editing ? "PUT" : "POST";

      const res = await api(endpoint, method, formData);
      if (res.status === 200 || res.status === 201) {
        alert(`Student ${editing ? "updated" : "created"} successfully!`);
        setFormData({ name: "", email: "", password: "", role: "student" });
        setEditing(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        alert(res.data?.message || "Failed to save student");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      password: "",
      role: student.role,
    });
    setEditing(true);
    setSelectedStudent(student);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await api(CONSTANTS.API.USERS.BY_ID(id), "DELETE");
    if (res.status === 200) fetchStudents();
    else alert("Failed to delete student");
  };

  return (
    <div className="p-6 bg-background min-h-screen text-foreground transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🎓 Student Management
      </h1>

      {/* ➕ Student Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-(--color-background) p-6 rounded-2xl shadow-md grid gap-4"
      >
        <input
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 rounded w-full"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 rounded w-full"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

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
          </>
        )}

        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-2 disabled:opacity-60"
        >
          {editing ? "Update Student" : "Add Student"}
        </button>
      </form>

      {/* 📋 Student List */}
      <div className="mt-8 max-w-4xl mx-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-center text-gray-500">No students found</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Courses</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.email}</td>
                  <td className="p-2 capitalize">{s.role}</td>
                  <td className="p-2">
                    {s.coursesEnrolled.length > 0
                      ? s.coursesEnrolled.map((c) => c.title).join(", ")
                      : "None"}
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-2 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        setSelectedStudent(
                          selectedStudent?._id === s._id ? null : s
                        )
                      }
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      {selectedStudent?._id === s._id
                        ? "Hide Courses"
                        : "View Courses"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Selected Student Courses */}
      {selectedStudent && selectedStudent.coursesEnrolled.length > 0 && (
        <div className="max-w-4xl mx-auto mt-4 p-4 border rounded bg-(--color-background)">
          <h3 className="font-semibold mb-2">
            {selectedStudent.name}'s Enrolled Courses:
          </h3>
          <ul className="list-disc list-inside">
            {selectedStudent.coursesEnrolled.map((c) => (
              <li key={c._id}>
                {c.title} | $ {c.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
