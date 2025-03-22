import { useState } from 'react';
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { Label } from "../../../Components/ui/label";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function loginUser(event) {
    event.preventDefault();

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.user) {
      localStorage.setItem('token', data.user);
      window.location.href = '/profile';
    } else {
      alert('Please check your username and password');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 max-w-md w-full">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6 text-center">Login</h1>
        <form onSubmit={loginUser} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              Password
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </Button>
        </form>
        <div className="mt-6 text-center">
          <a href="http://localhost:3000/auth/google">
            <Button
              className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-black rounded-xl py-3 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
            >
              Login with Google <FcGoogle className='text-2xl'/>
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:text-blue-700 font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;