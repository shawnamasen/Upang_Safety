import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const passwordRegex = {
      length: /^.{8,16}$/,
      uppercase: /[A-Z]/,
      number: /[0-9]/,
      special: /[!@#$%^&*(),.?":{}|<>]/,
    };

    if (!passwordRegex.length.test(pwd))
      return "Password must be between 8 and 16 characters.";
    if (!passwordRegex.uppercase.test(pwd))
      return "Password must contain at least one uppercase letter.";
    if (!passwordRegex.number.test(pwd))
      return "Password must contain at least one number.";
    if (!passwordRegex.special.test(pwd))
      return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // ✅ Client-side password validation
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
      } else {
        setMessage(data.message);
        setTimeout(() => navigate("/signin"), 2500);
      }
    } catch (err) {
      console.error("Reset error:", err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src="/images/phinma-logo.png"
            alt="PHINMA Education"
            className="w-28 mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Reset Password
          </h2>
          <p className="text-gray-500 text-sm">
            Create a new password to access your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-green-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-green-600"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm text-center mb-4">{message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md"
          >
            Reset Password
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          PHINMA Education • University of Pangasinan
        </p>
      </div>
    </div>
  );
}
