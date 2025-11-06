export const CONSTANTS = {
  // 🔐 Auth & Storage
  TOKEN: "token",
  STORAGE: "storage",
  TOKEN_EVENT: "tokenChanged",

  // 🌐 Routes
  ROUTES: {
    ROOT: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
    COURSES: "/dashboard/courses",
    ENROLLMENTS: "/dashboard/enrollments",
  },

  // 📘 Navigation Labels
  NAV: {
    PROFILE: "Profile",
    COURSES: "Courses",
    ENROLLMENTS: "Enrollments",
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
    },

    USER: {
      PROFILE: "/user/profile",
      UPDATE: "/user/update",
    },

    COURSES: {
      ALL: "/courses",
      BY_ID: (id: string | number) => `/courses/${id}`,
    },

    ENROLLMENTS: {
      ALL: "/enrollments",
      BY_ID: (id: string | number) => `/enrollments/${id}`,
    },
  },

  // 💬 User Messages
  MESSAGES: {
    REGISTER_SUCCESS: "Registration successful! Please log in.",
    REGISTER_FAIL: "Registration failed. Please try again.",
    LOGIN_SUCCESS: "Login successful!",
    LOGIN_FAIL: "Invalid email or password.",
    LOGOUT_SUCCESS: "You have been logged out.",
  },
} as const;
