import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { FcGoogle } from "react-icons/fc";

function Login() {
  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-indigo-900/50 to-black overflow-hidden">
      <div className="bg-gray-900/80 border border-gray-700 shadow-xl rounded-2xl p-8 backdrop-blur-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Login
        </h1>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-300 uppercase tracking-wide"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
            />
          </div>
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </Button>
        </div>
        <div className="mt-6 text-center">
          <a href="http://localhost:3000/auth/google">
            <Button className="w-full bg-gray-700 hover:bg-gray-600 transition duration-300 shadow-md text-white rounded-xl py-3 flex items-center justify-center gap-2">
              Login with Google <FcGoogle className="text-2xl" />
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;