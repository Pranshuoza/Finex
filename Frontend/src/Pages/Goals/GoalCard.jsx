import { useState } from "react";
import { Calendar, Edit, Trash2, CheckCircle2 } from "lucide-react";

export default function GoalCard({ goal, onUpdate, onDelete }) {
  // If goal is undefined, return a fallback UI or null
  if (!goal) {
    return <div className="text-gray-400 p-5">No goal data available</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    currentAmount: goal.currentAmount || 0,
    monthlyInvestment: goal.monthlyInvestment || 0,
  });

  const progressPercentage = ((goal.currentAmount || 0) / goal.goalAmount) * 100;
  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
      : "N/A";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value) || 0,
    }));
  };

  const handleSave = () => {
    onUpdate(goal._id, editValues.currentAmount, editValues.monthlyInvestment);
    setIsEditing(false);
  };

  return (
    <div className="relative bg-gradient-to-bl from-purple-900/50 via-gray-900/80 to-indigo-900/50 p-5 rounded-xl overflow-hidden group">
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-purple-500/20 via-fuchsia-500/10 to-indigo-500/20"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-white">{goal.goalName || "Unnamed Goal"}</h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <Edit className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => onDelete(goal._id)}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2 mb-4">
            <div>
              <label className="block text-sm text-gray-400">Current Amount (₹)</label>
              <input
                type="number"
                name="currentAmount"
                value={editValues.currentAmount}
                onChange={handleInputChange}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400">Monthly Investment (₹)</label>
              <input
                type="number"
                name="monthlyInvestment"
                value={editValues.monthlyInvestment}
                onChange={handleInputChange}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-400 mb-2">{goal.description || "No description"}</div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-400">Deadline:</span>
              </div>
              <span>{formatDate(goal.goalDate)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Monthly Investment:</span>
              <span>₹{(goal.monthlyInvestment || 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm font-medium">
                  ₹{(goal.currentAmount || 0).toLocaleString("en-IN")} (₹
                  {(goal.goalAmount - (goal.currentAmount || 0)).toLocaleString("en-IN")} to go)
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${goal.completed ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-indigo-500"}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{progressPercentage.toFixed(0)}% complete</span>
                {goal.completed && <CheckCircle2 className="h-4 w-4 text-green-400" />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}