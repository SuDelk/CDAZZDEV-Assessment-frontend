export const CONSTANTS = {
  // 🔐 Auth & Storage
  TOKEN: "token",
  STORAGE: "storage",
  TOKEN_EVENT: "tokenChanged",
  ROLE: "role",

  // 🌐 Routes
  ROUTES: {
    ROOT: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
    COURSES: "/dashboard/courses",
    ENROLLMENTS: "/dashboard/enrollments",

    ADMIN: {
      ROOT: "/admin",
      LOGIN: "/admin/login",
      DASHBOARD: "/admin/dashboard",
      COURSES: "/admin/dashboard/courses",
      ENROLLMENTS: "/admin/dashboard/enrollments",
    },
  },

  // 📘 Navigation Labels
  NAV: {
    PROFILE: "Profile",
    COURSES: "Courses",
    ENROLLMENTS: "Enrollments",
    ADMIN: {
      COURSES: "Manage Courses",
      ENROLLMENTS: "Enrollment Requests",
    },
  },

  // 🧠 Metadata
  META: {
    TITLE: "CDazzDev Assessment",
    DESCRIPTION: "A simple assessment application for CDazzDev.",
  },

  // 🌍 API Endpoints
  API: {
    BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",

    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      ADMIN_LOGIN: "/auth/admin/login", // ✅ corrected admin login route
    },

    USER: {
      PROFILE: "/user/profile",
      UPDATE: "/user/update",
    },

    // ✅ Admin also uses same course/enrollment endpoints with extra permissions
    COURSES: {
      ALL: "/courses",
      BY_ID: (id: string | number) => `/courses/${id}`,
      ADD: "/courses",
      DELETE: (id: string | number) => `/courses/${id}`,
    },

    ENROLLMENTS: {
      ALL: "/enrollments",
      BY_ID: (id: string | number) => `/enrollments/${id}`,
      APPROVE: (id: string | number) => `/enrollments/${id}/approve`,
      DECLINE: (id: string | number) => `/enrollments/${id}/decline`,
    },
  },

  // 💬 User & Admin Messages
  MESSAGES: {
    REGISTER_SUCCESS: "Registration successful! Please log in.",
    REGISTER_FAIL: "Registration failed. Please try again.",
    LOGIN_SUCCESS: "Login successful!",
    LOGIN_FAIL: "Invalid email or password.",
    LOGOUT_SUCCESS: "You have been logged out.",

    ADMIN_LOGIN_SUCCESS: "Welcome back, Admin!",
    ADMIN_LOGIN_FAIL: "Invalid admin credentials.",
    COURSE_ADDED: "Course added successfully.",
    COURSE_DELETED: "Course deleted successfully.",
    ENROLL_APPROVED: "Enrollment request approved.",
    ENROLL_DECLINED: "Enrollment request declined.",
  },
} as const;
