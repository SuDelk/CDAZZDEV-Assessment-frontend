"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // your existing API helper

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ✅ Fetch all courses
  const fetchCourses = async () => {
    const res = await api("/courses", "GET");
    if (res.status === 200) setCourses(res.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ✅ Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!form.title.trim()) return setError("Title is required");
    if (form.price <= 0) return setError("Price must be greater than 0");

    try {
      let res;
      if (editingId) {
        res = await api(`/courses/${editingId}`, "PUT", form);
      } else {
        res = await api("/courses", "POST", form);
      }

      if (res.status === 200 || res.status === 201) {
        alert(
          editingId
            ? "Course updated successfully!"
            : "Course added successfully!"
        );
        setForm({ title: "", description: "", price: 0 });
        setEditingId(null);
        fetchCourses();
      } else {
        setError(res.data?.message || "Error saving course");
      }
    } catch (err) {
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit course
  const handleEdit = (course: Course) => {
    setForm(course);
    setEditingId(course._id || null);
  };

  // ✅ Delete course
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this course?")) return;

    const res = await api(`/courses/${id}`, "DELETE");
    if (res.status === 200) {
      alert("Course deleted!");
      fetchCourses();
    } else {
      setError(res.data?.message || "Failed to delete course");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Course Management
      </h1>

      {/* 🧾 Form Section */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col gap-3">
          <input
            name="title"
            placeholder="Course Title"
            value={form.title}
            onChange={handleChange}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="price"
            type="number"
            placeholder="Course Price"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : editingId ? "Update Course" : "Add Course"}
        </button>
      </form>

      {/* 📋 Course List */}
      <h2 className="text-lg font-semibold mb-2">All Courses</h2>
      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course._id}
            className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
          >
            <div>
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-gray-500">{course.description}</p>
              <p className="text-sm font-medium text-blue-600">
                Rs. {course.price}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(course)}
                className="text-sm bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
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
        ))}

        {courses.length === 0 && (
          <p className="text-gray-500">No courses found.</p>
        )}
      </div>
    </div>
  );
}
