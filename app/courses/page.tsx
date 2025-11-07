"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CONSTANTS } from "@/lib/constants";
import Swal from "sweetalert2";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
}

interface Student {
  _id: string;
  coursesEnrolled: Course[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string>(""); // courseId being processed

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "enrolled" | "notEnrolled">("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const studentRes = await api(CONSTANTS.API.USERS.PROFILE);
        const coursesRes = await api(CONSTANTS.API.COURSES.ALL);

        setStudent(studentRes?.data?.user || null);
        setCourses(coursesRes?.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    if (!student) return;
    setProcessing(courseId);

    try {
      const res = await api(CONSTANTS.API.ENROLLMENTS.CREATE, "POST", {
        userId: student._id,
        courseId,
        status: "active",
      });

      if (res.status === 201) {
        Swal.fire("Enrolled!", "You have successfully enrolled in this course.", "success");
        setStudent({
          ...student,
          coursesEnrolled: [...student.coursesEnrolled, courses.find((c) => c._id === courseId)!],
        });
      } else {
        Swal.fire("Error", res.data?.message || "Failed to enroll", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to enroll", "error");
    } finally {
      setProcessing("");
    }
  };

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
      setProcessing(courseId);

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
      } finally {
        setProcessing("");
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    const enrolled = student?.coursesEnrolled.some((c) => c._id === course._id);
    const matchesTitle = course.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "enrolled" && !enrolled) return false;
    if (statusFilter === "notEnrolled" && enrolled) return false;

    return matchesTitle;
  });

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">Available Courses</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full sm:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full sm:w-1/4"
        >
          <option value="all" className="text-black">All</option>
          <option value="enrolled" className="text-black">Enrolled</option>
          <option value="notEnrolled" className="text-black">Not Enrolled</option>
        </select>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <p className="text-center text-gray-500">No courses found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredCourses.map((course) => {
            const enrolled = student?.coursesEnrolled.some((c) => c._id === course._id);
            return (
              <li
                key={course._id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-background flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-gray-500">{course.description}</p>
                  <p className="font-medium">Price: ${course.price}</p>
                </div>
                <div>
                  {enrolled ? (
                    <button
                      onClick={() => handleUnenroll(course._id)}
                      disabled={processing === course._id}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-60"
                    >
                      {processing === course._id ? "Processing..." : "Unenroll"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={processing === course._id}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-60"
                    >
                      {processing === course._id ? "Processing..." : "Enroll"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
