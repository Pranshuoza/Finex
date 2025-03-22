import React, { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, Wallet, Calendar, ArrowUpRight, LandmarkIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../Components/ui/card";
import { Alert, AlertDescription } from "../../Components/ui/alert";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../Components/ui/dialog";

const BASE_URL = "http://localhost:3000/investment";

const AddEditModal = ({ currentFD, setCurrentFD, onClose, onSubmit, loading, isEdit }) => (
  <Dialog open={true} onOpenChange={onClose}>
    <DialogContent className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-900">
          {isEdit ? "Edit Fixed Deposit" : "Add New Fixed Deposit"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 mt-6">
        <div className="space-y-2">
          <Label htmlFor="bankName" className="text-sm font-medium text-gray-700">Bank Name</Label>
          <Input
            id="bankName"
            type="text"
            value={currentFD.bankName}
            onChange={(e) => setCurrentFD({ ...currentFD, bankName: e.target.value })}
            className={`border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depositAmount" className="text-sm font-medium text-gray-700">Deposit Amount (₹)</Label>
          <Input
            id="depositAmount"
            type="number"
            value={currentFD.depositAmount}
            onChange={(e) => setCurrentFD({ ...currentFD, depositAmount: parseFloat(e.target.value) || 0 })}
            className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interestRate" className="text-sm font-medium text-gray-700">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            value={currentFD.interestRate}
            onChange={(e) => setCurrentFD({ ...currentFD, interestRate: parseFloat(e.target.value) || 0 })}
            className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={currentFD.startDate}
            onChange={(e) => setCurrentFD({ ...currentFD, startDate: e.target.value })}
            className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maturityDate" className="text-sm font-medium text-gray-700">Maturity Date</Label>
          <Input
            id="maturityDate"
            type="date"
            value={currentFD.maturityDate}
            onChange={(e) => setCurrentFD({ ...currentFD, maturityDate: e.target.value })}
            className="border border-gray-300 rounded-xl bg-white py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
          />
        </div>
      </div>
      <DialogFooter className="mt-8 flex justify-end space-x-3">
        <Button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 px-6 transition-all duration-200 shadow-md hover:shadow-lg"
          disabled={loading}
        >
          {loading ? "Processing..." : isEdit ? "Update" : "Add"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const FDApp = () => {
  const [fixedDeposits, setFixedDeposits] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentFD, setCurrentFD] = useState({
    bankName: "",
    depositAmount: 0,
    interestRate: 0,
    startDate: "",
    maturityDate: "",
  });
  const [stats, setStats] = useState({
    totalInvestment: 0,
    totalInterestEarned: 0,
    totalMaturityAmount: 0,
    numberOfFDs: 0,
  });

  useEffect(() => {
    if (token) fetchFDs();
  }, [token]);

  const fetchFDs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/`, { headers: { "x-access-token": token } });
      setFixedDeposits(response.data.fixedDeposits);
      calculateStats(response.data.fixedDeposits);
    } catch (error) {
      setError("Failed to fetch fixed deposits");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (fds) => {
    const stats = {
      totalInvestment: 0,
      totalInterestEarned: 0,
      totalMaturityAmount: 0,
      numberOfFDs: fds.length,
    };

    fds.forEach(fd => {
      stats.totalInvestment += fd.depositAmount;
      stats.totalInterestEarned += fd.interestEarned;
      stats.totalMaturityAmount += fd.maturityAmount;
    });

    setStats(stats);
  };

  const handleFDAction = async (action) => {
    try {
      setLoading(true);
      let response;
      
      switch(action) {
        case "add":
          response = await axios.post(`${BASE_URL}/addFD`, currentFD, { headers: { "x-access-token": token } });
          setShowAddModal(false);
          break;
        case "update":
          response = await axios.put(`${BASE_URL}/updateFD`, currentFD, { headers: { "x-access-token": token } });
          setShowEditModal(false);
          break;
        case "remove":
          response = await axios.delete(`${BASE_URL}/removeFD`, { 
            headers: { "x-access-token": token },
            data: { bankName: currentFD.bankName }
          });
          break;
        default:
          throw new Error("Invalid action");
      }
      
      setFixedDeposits(response.data.investment.fixedDeposits);
      calculateStats(response.data.investment.fixedDeposits);
    } catch (error) {
      setError(`Failed to ${action} fixed deposit`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && fixedDeposits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-xl font-medium">Loading your fixed deposits...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">Fixed Deposits</h1>
          <Button
            onClick={() => {
              setCurrentFD({
                bankName: "",
                depositAmount: 0,
                interestRate: 0,
                startDate: new Date().toISOString().split('T')[0],
                maturityDate: "",
              });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-2 px-5 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <LandmarkIcon className="w-5 h-5 mr-2" />
            Add New FD
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                <Wallet className="w-4 h-4 mr-2" /> Total Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">₹{stats.totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                <ArrowUpRight className="w-4 h-4 mr-2" /> Total Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">₹{stats.totalInterestEarned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Maturity Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">₹{stats.totalMaturityAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                <LandmarkIcon className="w-4 h-4 mr-2" /> Active FDs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.numberOfFDs}</div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 shadow-sm animate-in fade-in-0 duration-200">
            <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md divide-y divide-gray-100 overflow-hidden">
          {fixedDeposits.map((fd) => (
            <div key={fd.bankName} className="p-6 hover:bg-gray-50 transition-all duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {fd.bankName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{fd.bankName}</h3>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(fd.startDate).toLocaleDateString()} - {new Date(fd.maturityDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-medium">Principal</div>
                    <div className="text-base font-semibold text-gray-900">₹{fd.depositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-medium">Rate</div>
                    <div className="text-base font-semibold text-gray-900">{fd.interestRate}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-medium">Interest</div>
                    <div className="text-base font-semibold text-green-600">₹{fd.interestEarned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      onClick={() => {
                        setCurrentFD(fd);
                        setShowEditModal(true);
                      }}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-sm px-4 py-2 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setCurrentFD(fd);
                        handleFDAction("remove");
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm px-4 py-2 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {fixedDeposits.length === 0 && (
            <div className="p-10 text-center text-gray-500 bg-gray-50">
              No fixed deposits yet. Add your first FD to start tracking your investments!
            </div>
          )}
        </div>

        {showAddModal && (
          <AddEditModal
            currentFD={currentFD}
            setCurrentFD={setCurrentFD}
            onClose={() => setShowAddModal(false)}
            onSubmit={() => handleFDAction("add")}
            loading={loading}
            isEdit={false}
          />
        )}
        {showEditModal && (
          <AddEditModal
            currentFD={currentFD}
            setCurrentFD={setCurrentFD}
            onClose={() => setShowEditModal(false)}
            onSubmit={() => handleFDAction("update")}
            loading={loading}
            isEdit={true}
          />
        )}
      </div>
    </div>
  );
};

export default FDApp;