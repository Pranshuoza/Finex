import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { FcGoogle } from "react-icons/fc";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function registerUser(event) {
    event.preventDefault();

    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (data.user) {
      localStorage.setItem("token", data.user);
      navigate("/profile");
    } else {
      alert("Registration failed. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-indigo-900/50 to-black overflow-hidden">
      <div className="bg-gray-900/80 border border-gray-700 shadow-xl rounded-2xl p-8 backdrop-blur-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Register
        </h1>
        <form onSubmit={registerUser} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Full Name"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Your Email"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Password
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Create Password"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Sign Up
          </Button>
        </form>
        <div className="mt-6 text-center">
          <a href="http://localhost:3000/auth/google">
            <Button className="w-full bg-gray-700 hover:bg-gray-600 transition duration-300 shadow-md text-white rounded-xl py-3 flex items-center justify-center gap-2">
              Sign up with Google <FcGoogle className="text-2xl" />
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
