import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to the CDazzDev Assessment
      </h1>
      <Image
        src="/logo.png"
        alt="CDazzDev Logo"
        width={200}
        height={200}
        className="mb-6"
      />
      <p className="text-lg">
        Please register or log in to continue to the assessment.
      </p>
      {/* Buttons for login and register */}
      <div className="mt-6 space-x-4">
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Register
        </a>
      </div>
    </div>
  );
}
