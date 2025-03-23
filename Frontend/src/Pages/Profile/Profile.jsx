import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../Components/ui/select";
import { Loader2 } from "lucide-react"; // For a loading spinner

const BASE_API_URL = "http://localhost:3000"; // Adjust if your API base URL differs

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get("token");
    const errorParam = urlParams.get("error");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      navigate("/profile", { replace: true });
    }

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      navigate("/profile", { replace: true });
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/profile`, {
          headers: { "x-access-token": token },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch profile");
        }
        const data = await response.json();
        if (data.status === "ok") {
          setProfile(data.profile);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("An error occurred. Please try again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, location]);

  // Handler for connecting to Upstox
  const handleConnectUpstox = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${BASE_API_URL}/upstox/auth`, {
        headers: { "x-access-token": token },
      });
      if (!response.ok) {
        throw new Error("Failed to get Upstox auth URL");
      }
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting to Upstox:", error);
      setError("Failed to connect to Upstox. Please try again.");
    }
  };

  // Handler for connecting to Zerodha
  const handleConnectZerodha = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${BASE_API_URL}/zerodha/auth`, {
        headers: { "x-access-token": token },
      });
      if (!response.ok) {
        throw new Error("Failed to get Zerodha auth URL");
      }
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting to Zerodha:", error);
      setError("Failed to connect to Zerodha. Please try again.");
    }
  };

  // Handler for connecting to Groww
  const handleConnectGroww = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${BASE_API_URL}/groww/auth`, {
        headers: { "x-access-token": token },
      });
      if (!response.ok) {
        throw new Error("Failed to get Groww auth URL");
      }
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting to Groww:", error);
      setError("Failed to connect to Groww. Please try again.");
    }
  };

  // Handler for connecting to Angel One
  const handleConnectAngelOne = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`${BASE_API_URL}/angelone/auth`, {
        headers: { "x-access-token": token },
      });
      if (!response.ok) {
        throw new Error("Failed to get Angel One auth URL");
      }
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting to Angel One:", error);
      setError("Failed to connect to Angel One. Please try again.");
    }
  };

  // Handler for editing the profile
  const handleEditProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const form = e.target;

    try {
      const response = await fetch(`${BASE_API_URL}/profile/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          mobileNumber: form.mobileNumber.value,
          risk: form.risk.value,
          investmentGoal: form.investmentGoal.value,
          monthlyIncome: parseFloat(form.monthlyIncome.value) || 0,
          currentBalance: parseFloat(form.currentBalance.value) || 0,
        }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        alert("Profile updated successfully");
        window.location.reload();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_API_URL}/profile/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        alert("Password changed successfully");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert(
        "An error occurred while changing your password. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900/50 to-black">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-semibold mb-8 text-white tracking-tight">
        User Profile
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-gray-900/80 border border-gray-700 shadow-xl rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Profile Information
          </h2>
          {profile && (
            <div className="space-y-6 text-white">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">Name:</span>
                <span className="text-lg">{profile.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">Email:</span>
                <span className="text-lg">{profile.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">Mobile:</span>
                <span className="text-lg">
                  {profile.mobileNumber || "Not provided"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">
                  Risk Tolerance:
                </span>
                <span
                  className={`text-lg font-medium ${
                    profile.risk === "Low"
                      ? "text-green-400"
                      : profile.risk === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {profile.risk}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">
                  Investment Goal:
                </span>
                <span className="text-lg">{profile.investmentGoal}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">
                  Monthly Income:
                </span>
                <span className="text-lg">
                  ₹{profile.monthlyIncome.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium w-40">
                  Current Balance:
                </span>
                <span className="text-lg">
                  ₹{profile.currentBalance.toLocaleString() || "0"}
                </span>
              </div>
              {/* Broker Connections */}
              <div className="space-y-4 mt-6">
                {/* Upstox Connection */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    Upstox Connection
                  </p>
                  <Button
                    onClick={handleConnectUpstox}
                    disabled={profile?.upstoxAccessToken}
                    className={`w-full flex items-center justify-center gap-2 ${
                      profile?.upstoxAccessToken
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from--500 to-purple-600 hover:from--600 hover:to-purple-700"
                    } text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    {/* Upstox Logo */}
                    <img
                      src="https://asset.brandfetch.io/idH_PAk3wi/idhR2wdGPK.jpeg?updated=1708536171561"
                      alt="Upstox Logo"
                      className="w-6 h-6 rounded-sm"
                    />

                    {profile?.upstoxAccessToken
                      ? "Connected to Upstox"
                      : "Connect with Upstox"}
                  </Button>
                </div>
                {/* Zerodha Connection */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    Zerodha Connection
                  </p>
                  <Button
                    onClick={handleConnectZerodha}
                    disabled={profile?.zerodhaAccessToken}
                    className={`w-full flex items-center justify-center gap-2 ${
                      profile?.zerodhaAccessToken
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from--500 to-red-600 hover:from--600 hover:to-red-700"
                    } text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    {/* Zerodha Logo */}
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/1/15/Zerodha_Kite_logo.svg"
                      alt="Zerodha Logo"
                      className="w-6 h-6 rounded-sm"
                    />

                    {profile?.zerodhaAccessToken
                      ? "Connected to Zerodha"
                      : "Connect with Zerodha"}
                  </Button>
                </div>
                {/* Groww Connection */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    Groww Connection
                  </p>
                  <Button
                    onClick={handleConnectGroww}
                    disabled={profile?.growwAccessToken}
                    className={`w-full flex items-center justify-center gap-2 ${
                      profile?.growwAccessToken
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from--500 to-green-600 hover:from--600 hover:to-green-700"
                    } text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    {/* Groww Logo */}
                    <img
                      src="https://i.pinimg.com/originals/77/ca/55/77ca550a2332ea82f01dd03bfdf6c62f.png"
                      alt="Groww Logo"
                      className="w-8 h-6 rounded-sm"
                    />

                    {profile?.growwAccessToken
                      ? "Connected to Groww"
                      : "Connect with Groww"}
                  </Button>
                </div>
                {/* Angel One Connection */}
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    Angel One Connection
                  </p>
                  <Button
                    onClick={handleConnectAngelOne}
                    disabled={profile?.angelOneAccessToken}
                    className={`w-full flex items-center justify-center gap-2 ${
                      profile?.angelOneAccessToken
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from--500 to-blue-600 hover:from--600 hover:to-blue-700"
                    } text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    <img
                      src="https://asset.brandfetch.io/idDA95rr8l/idok3mM_r-.jpeg"
                      alt="Angel One Logo"
                      className="w-6 h-6"
                    />
                    {profile?.angelOneAccessToken
                      ? "Connected to Angel One"
                      : "Connect with Angel One"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        <div className="bg-gray-900/80 border border-gray-700 shadow-xl rounded-2xl p-6 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-white mb-6"></h2>
          <form onSubmit={handleEditProfile} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Name"
                defaultValue={profile?.name}
                required
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={profile?.email}
                required
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="mobileNumber"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                placeholder="Mobile Number"
                defaultValue={profile?.mobileNumber}
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="risk"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Risk Tolerance
              </Label>
              <Select name="risk" defaultValue={profile?.risk} required>
                <SelectTrigger className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm">
                  <SelectValue placeholder="Select Risk Tolerance" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border border-gray-600 rounded-xl shadow-lg text-white">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="investmentGoal"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Investment Goal
              </Label>
              <Select
                name="investmentGoal"
                defaultValue={profile?.investmentGoal}
                required
              >
                <SelectTrigger className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm">
                  <SelectValue placeholder="Select Investment Goal" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border border-gray-600 rounded-xl shadow-lg text-white">
                  <SelectItem value="Retirement">Retirement</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Marriage">Marriage</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="monthlyIncome"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Monthly Income
              </Label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                placeholder="Monthly Income"
                defaultValue={profile?.monthlyIncome}
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="currentBalance"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Current Balance
              </Label>
              <Input
                id="currentBalance"
                name="currentBalance"
                type="number"
                placeholder="Current Balance"
                defaultValue={profile?.currentBalance}
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Save Changes
            </Button>
          </form>

          <Button
            onClick={() => setShowPasswordModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-gray-900/80 border border-gray-700 rounded-2xl shadow-xl p-8 max-w-md backdrop-blur-lg text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-gray-400 uppercase tracking-wide"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-600 rounded-xl bg-gray-700/50 text-white py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 flex justify-end space-x-3">
            <Button
              onClick={() => setShowPasswordModal(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;