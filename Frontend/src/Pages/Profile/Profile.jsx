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

const BASE_API_URL = "http://localhost:3000"; // Adjust if your API base URL differs

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [residentialStatus, setResidentialStatus] = useState("");
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
      setError(decodeURIComponent(errorParam)); // Display the error from the backend redirect
      navigate("/profile", { replace: true }); // Clean up URL
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
          setResidentialStatus(data.profile.residentialStatus || "");
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

  const handleEditProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const form = e.target;

    try {
      const response = await fetch(`${BASE_API_URL}/profile/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-token": token },
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          mobileNumber: form.mobileNumber.value,
          age: parseInt(form.age.value),
          residentialStatus: residentialStatus,
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
        headers: { "Content-Type": "application/json", "x-access-token": token },
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
      alert("An error occurred while changing your password. Please try again.");
    }
  };

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
      window.location.href = authUrl; // Redirect to Upstox login
    } catch (error) {
      console.error("Error connecting to Upstox:", error);
      setError("Failed to connect to Upstox. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-xl font-medium">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <div className="mb-10 pb-6 border-b border-gray-200">
        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">User Profile</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          {profile && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Name</p>
                <p className="text-lg font-medium text-gray-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Email</p>
                <p className="text-lg font-medium text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Mobile</p>
                <p className="text-lg font-medium text-gray-900">{profile.mobileNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Age</p>
                <p className="text-lg font-medium text-gray-900">{profile.age}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Residential Status</p>
                <p className="text-lg font-medium text-gray-900">{profile.residentialStatus}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Upstox Connection</p>
                <p className="text-lg font-medium text-gray-900">
                  {profile.upstoxAccessToken ? "Connected" : "Not Connected"}
                </p>
              </div>
            </div>
          )}
          {/* Connect with Upstox Button */}
          <Button
            onClick={handleConnectUpstox}
            disabled={profile?.upstoxAccessToken}
            className={`w-full mt-6 ${
              profile?.upstoxAccessToken
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            } text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {profile?.upstoxAccessToken ? "Already Connected" : "Connect with Upstox"}
          </Button>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Profile</h2>
          <form onSubmit={handleEditProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Name"
                defaultValue={profile?.name}
                required
                className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                defaultValue={profile?.email}
                required
                className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                placeholder="Mobile Number"
                defaultValue={profile?.mobileNumber}
                required
                className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Age"
                defaultValue={profile?.age}
                required
                className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="residentialStatus" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                Residential Status
              </Label>
              <Select
                name="residentialStatus"
                defaultValue={profile?.residentialStatus}
                value={residentialStatus}
                onValueChange={setResidentialStatus}
                required
              >
                <SelectTrigger
                  id="residentialStatus"
                  className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                >
                  <SelectValue placeholder="Select Residential Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <SelectItem value="Resident">Resident</SelectItem>
                  <SelectItem value="Not Ordinarily Resident">Not Ordinarily Resident</SelectItem>
                  <SelectItem value="Non Resident">Non Resident</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 transition-all duration-200 shadow-md hover:shadow-lg"
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
        <DialogContent className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-gray-900">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-sm font-medium text-gray-700 uppercase tracking-wide"
              >
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
          </div>
          <DialogFooter className="mt-8 flex justify-end space-x-3">
            <Button
              onClick={() => setShowPasswordModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg"
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