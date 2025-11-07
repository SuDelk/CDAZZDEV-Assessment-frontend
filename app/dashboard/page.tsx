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
        // Find the enrollment ID for this student-course
        const allEnrollments = await api(CONSTANTS.API.ENROLLMENTS.ALL);
        const enrollment = allEnrollments.data.find(
          (e: any) =>
            e.userId._id === student._id && e.courseId._id === courseId
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
          Swal.fire(
            "Unenrolled!",
            "You have been removed from the course.",
            "success"
          );
          setStudent({
            ...student,
            coursesEnrolled: student.coursesEnrolled.filter(
              (c) => c._id !== courseId
            ),
          });
        } else {
          Swal.fire(
            "Error",
            res.data?.message || "Failed to unenroll",
            "error"
          );
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to unenroll", "error");
      }
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!student) return <p className="text-center mt-10">Student not found</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-background border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">{student.name}'s Dashboard</h1>
      <p className="mb-2">
        <strong>Email:</strong> {student.email}
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Enrolled Courses</h2>
      {student.coursesEnrolled.length === 0 ? (
        <p className="text-gray-500">
          You are not enrolled in any courses yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {student.coursesEnrolled.map((c) => (
            <li
              key={c._id}
              className="p-3 border border-gray-300 dark:border-gray-700 rounded-md flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">{c.description}</p>
                <p className="text-sm font-medium">Price: ${c.price}</p>
              </div>
              <button
                onClick={() => handleUnenroll(c._id)}
                className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Unenroll
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
