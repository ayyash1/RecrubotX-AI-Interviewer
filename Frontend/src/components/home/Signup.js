import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook } from "react-icons/fa";

import { registerUser } from "../../utils/userDatabase";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const result = await registerUser(formData);
      if (result.success) {
        setMessage("Signup successful! Welcome to RecruBotX.");
        // Optional: Redirect or clear form
      } else {
        setMessage(result.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Create Your Account
        </h2>

        {/* First Name input */}
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Last Name input */}
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Email input */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Password input */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <FcGoogle className="mr-2 text-xl" /> Continue with Google
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <FaGithub className="mr-2 text-xl text-gray-800" /> Continue with GitHub
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <FaFacebook className="mr-2 text-xl text-blue-600" /> Continue with Facebook
          </button>
        </div>

        {/* Status message */}
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </form>
    </div>
  );
};

export default Signup;
