# CDazzDev Assessment Frontend

A modern, full-featured online learning platform built with Next.js 16, TypeScript, and Tailwind CSS. This application provides a comprehensive course management system with role-based access control for students and administrators.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [API Integration](#api-integration)
- [Features Documentation](#features-documentation)

## Overview

CDazzDev Learning Platform is a responsive web application that enables students to browse and enroll in courses while providing administrators with tools to manage courses, students, and enrollments. The platform features a modern UI with dark mode support, real-time validation, and comprehensive accessibility testing.

## Features

### Student Features
- **User Authentication**: Secure registration and login with form validation
- **Course Browsing**: View all available courses with search and filter capabilities
- **Course Enrollment**: Enroll in courses with one-click enrollment
- **Personal Dashboard**: View enrolled courses and manage enrollments
- **Course Management**: Unenroll from courses with confirmation dialogs
- **Pagination**: Navigate through large course lists efficiently

### Admin Features
- **Course Management**: Create, edit, and delete courses
- **Student Management**: View, add, edit, and delete student accounts
- **Enrollment Management**: Create and manage course enrollments
- **Advanced Filters**: Search and filter students, courses, and enrollments
- **Bulk Operations**: Efficient management of multiple records

### UI/UX Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic theme detection with manual override
- **Loading States**: Visual feedback during API operations
- **Form Validation**: Real-time input validation with error messages
- **Confirmation Dialogs**: SweetAlert2 integration for important actions
- **Animated Effects**: Smooth transitions and engaging visual effects

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: 
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - Custom CSS animations
- **UI Components**: 
  - [Material-UI (MUI) 7.3](https://mui.com/)
  - [Lucide React Icons](https://lucide.dev/)
- **State Management**: React Hooks (useState, useEffect)
- **Form Handling**: Custom validation with real-time feedback
- **Notifications**: [SweetAlert2](https://sweetalert2.github.io/)
- **Testing**: 
  - [Jest 30.2](https://jestjs.io/)
  - [React Testing Library 16.3](https://testing-library.com/react)
  - [Jest DOM](https://github.com/testing-library/jest-dom)
- **Code Quality**: 
  - [ESLint 9](https://eslint.org/)
  - TypeScript Strict Mode

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher (comes with Node.js)
- **Git**: For cloning the repository

You can verify your installations by running:

```bash
node --version
npm --version
git --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SuDelk/CDAZZDEV-Assessment-frontend.git
cd CDAZZDEV-Assessment-frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all the required dependencies listed in `package.json`.

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

To create an optimized production build:

```bash
npm run build
```

### Start Production Server

After building, start the production server:

```bash
npm start
```

The production server will run at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
CDAZZDEV-Assessment-frontend/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin panel routes
│   │   ├── courses/              # Course management
│   │   ├── students/             # Student management
│   │   ├── enrollments/          # Enrollment management
│   │   └── page.tsx              # Admin home
│   ├── courses/                  # Student course browsing
│   ├── dashboard/                # Student dashboard
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable React components
│   ├── BackgroundEffects.tsx    # Animated background
│   └── ClientLayout.tsx          # Navigation and layout
├── lib/                          # Utility functions
│   ├── api.ts                    # API client
│   └── constants.ts              # Application constants
├── public/                       # Static assets
│   └── logo.png                  # Application logo
├── jest.config.ts                # Jest configuration
├── jest.setup.ts                 # Jest setup file
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Available Scripts

- **`npm run dev`**: Start development server with hot-reload
- **`npm run build`**: Create production build
- **`npm start`**: Start production server
- **`npm run lint`**: Run ESLint for code quality checks
- **`npm test`**: Run Jest test suite

## Environment Variables

Create a `.env.local` file in the root directory to configure environment variables:

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Available Environment Variables

- **`NEXT_PUBLIC_API_BASE_URL`**: Backend API URL (defaults to `http://localhost:5000/api`)

## Testing

The application includes comprehensive unit tests to ensure frontend accessibility and functionality.

### Running Tests

```bash
npm test
```

### Test Coverage

The test suite includes 61 tests across 7 test suites covering:

- **Login Page**: Form validation, error handling, authentication flow
- **Registration Page**: Form validation, password matching, user creation
- **Dashboard Page**: Student profile display, enrolled courses, unenrollment
- **Courses Page**: Course listing, enrollment, filtering, pagination
- **Admin Courses**: Course CRUD operations, search, pagination
- **Admin Students**: Student management, course assignments
- **Admin Enrollments**: Enrollment creation, filtering, status management

### Test Framework

The project uses **Jest** with **React Testing Library** to ensure:

- **Accessibility**: All interactive elements are properly labeled and keyboard accessible
- **Form Validation**: Real-time validation and error messages work correctly
- **User Interactions**: Button clicks, form submissions, and navigation work as expected
- **Error Handling**: Appropriate error messages are displayed
- **Loading States**: Loading indicators appear during async operations

### Writing Tests

Tests are co-located with their components using the `.test.tsx` extension:

```
app/
  login/
    page.tsx
    login.test.tsx
```

Example test structure:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";

describe("LoginPage", () => {
  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  });
});
```

## API Integration

The application connects to a RESTful API backend. The API client is configured in `lib/api.ts` and uses the following endpoints:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Course Endpoints
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Enrollment Endpoints
- `GET /api/enrollments` - List all enrollments
- `POST /api/enrollments` - Create enrollment
- `DELETE /api/enrollments/:id` - Remove enrollment

### User Endpoints
- `GET /api/auth` - List all users (admin)
- `GET /api/auth/students` - List all students (admin)
- `DELETE /api/auth/:id` - Delete user (admin)

## Features Documentation

### 1. Authentication System

**Registration**:
- Full name, email, and password validation
- Password confirmation with match validation
- Email format validation
- Minimum password length requirement (6 characters)
- Automatic redirect to login after successful registration

**Login**:
- Email and password validation
- Support for both student and admin login
- JWT token-based authentication
- Persistent sessions using localStorage
- Automatic role-based routing

### 2. Student Dashboard

Students can:
- View their profile information (name, email)
- See all enrolled courses with details (title, description, price)
- Unenroll from courses with confirmation dialog
- Access course management page

### 3. Course Browsing & Enrollment

Features include:
- **Search**: Filter courses by title
- **Status Filter**: View all courses, enrolled courses, or available courses
- **Pagination**: Navigate through courses (4 per page)
- **Enrollment**: One-click enrollment in available courses
- **Unenrollment**: Remove enrollment with confirmation
- **Visual Indicators**: Different button states for enrolled vs available courses

### 4. Admin Panel

#### Course Management
- Create new courses with title, description, and price
- Edit existing course details
- Delete courses with confirmation
- Search courses by title
- Pagination for large course lists

#### Student Management
- View all registered students
- Add new student accounts
- Edit student information
- Delete student accounts
- View student's enrolled courses
- Search students by name
- Pagination support

#### Enrollment Management
- Create enrollments between students and courses
- Autocomplete search for students and courses
- Filter enrollments by student, course, or status
- Update enrollment status (active/completed)
- Delete enrollments
- Pagination for enrollment list

### 5. UI Components

**BackgroundEffects**: Animated background with falling emojis and ripple effects for authentication pages

**ClientLayout**: 
- Dynamic navigation based on user role
- Responsive header with logo and navigation links
- Logout functionality with confirmation
- Active route highlighting

### 6. Accessibility Features

The application implements web accessibility best practices:
- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Responsive text sizing
- Form field labels and error messages
- Skip navigation links (where applicable)

All accessibility features are validated through Jest unit tests using Testing Library's accessibility queries.

---

## Contributing

When contributing to this project, please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass (`npm test`)
5. Run linting (`npm run lint`)
6. Submit a pull request

## License

This project is created as an assessment for CDazzDev.

## Support

For questions or issues, please contact the development team or create an issue in the repository.
