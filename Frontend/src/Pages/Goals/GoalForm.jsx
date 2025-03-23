import { Target, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function GoalForm({ onAddGoal, showForm, setShowForm }) {
  const [newGoal, setNewGoal] = useState({
    goalName: "",
    goalAmount: 0,
    currentAmount: 0,
    goalDate: "",
    description: "",
    monthlyInvestment: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal({
      ...newGoal,
      [name]: name === "goalAmount" || name === "currentAmount" || name === "monthlyInvestment" ? Number.parseFloat(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddGoal(newGoal);
    setNewGoal({ goalName: "", goalAmount: 0, currentAmount: 0, goalDate: "", description: "", monthlyInvestment: 0 });
    setShowForm(false);
  };

  return (
    showForm && (
      <div className="relative bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl overflow-hidden mb-6">
        <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/20 via-fuchsia-500/10 to-indigo-500/20"></div>
        <div className="relative z-10">
          <h3 className="font-medium mb-4 flex items-center">
            <Target className="h-4 w-4 mr-2 text-purple-400" />
            Create New Goal
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goal Name</label>
              <input
                type="text"
                name="goalName"
                value={newGoal.goalName}
                onChange={handleInputChange}
                required
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="e.g., Buy Gold"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goal Amount (₹)</label>
              <input
                type="number"
                name="goalAmount"
                value={newGoal.goalAmount}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Amount (₹)</label>
              <input
                type="number"
                name="currentAmount"
                value={newGoal.currentAmount}
                onChange={handleInputChange}
                min="0"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Investment (₹)</label>
              <input
                type="number"
                name="monthlyInvestment"
                value={newGoal.monthlyInvestment}
                onChange={handleInputChange}
                min="0"
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="1000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Date</label>
              <input
                type="date"
                name="goalDate"
                value={newGoal.goalDate}
                onChange={handleInputChange}
                required
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={newGoal.description}
                onChange={handleInputChange}
                className="w-full h-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="e.g., Saving for Diwali gold purchase"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}