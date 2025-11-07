"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  coursesEnrolled: Course[];
}

export default function DashboardPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await api(CONSTANTS.API.USERS.PROFILE);
        setStudent(res?.data?.user);
      } catch (err) {
        console.error(err);
        alert("Failed to load student info");
      } finally {
        setLoading(false);
      }
    }
    fetchStudent();
  }, []);

  const handleUnenroll = async (courseId: string) => {
    if (!student) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to unenroll from this course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unenroll",
    });

    if (result.isConfirmed) {
      try {
        const allEnrollments = await api(CONSTANTS.API.ENROLLMENTS.ALL);
        const enrollment = allEnrollments.data.find(
          (e: any) => e.userId._id === student._id && e.courseId._id === courseId
        );

        if (!enrollment) {
          Swal.fire("Error", "Enrollment not found", "error");
          return;
        }

        const res = await api(CONSTANTS.API.ENROLLMENTS.DELETE(enrollment._id), "DELETE");

        if (res.status === 200) {
          Swal.fire("Unenrolled!", "You have been removed from the course.", "success");
          setStudent({
            ...student,
            coursesEnrolled: student.coursesEnrolled.filter((c) => c._id !== courseId),
          });
        } else {
          Swal.fire("Error", res.data?.message || "Failed to unenroll", "error");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to unenroll", "error");
      }
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (!student) return <p className="text-center mt-10 text-gray-500">Student not found</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl transition-all">
      {/* Student Info */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-gray-100">{student.name}'s Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300"><strong>Email:</strong> {student.email}</p>
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Enrolled Courses</h2>

      {student.coursesEnrolled.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You are not enrolled in any courses yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {student.coursesEnrolled.map((c) => (
            <div
              key={c._id}
              className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">{c.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-2">{c.description}</p>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Price: ${c.price}</p>
              </div>
              <button
                onClick={() => handleUnenroll(c._id)}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Unenroll
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
