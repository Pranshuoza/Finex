import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import axios from "axios";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";
import AIRecommendations from "./AIRecommendations";
import ProjectionChart from "./ProjectionChart";
import FinancialMilestones from "./FinancialMilestones";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [investmentAmount] = useState(10000); // Hardcoded for demo
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get("http://localhost:3000/goals/user", {
          headers: { "x-access-token": token },
        });
        setGoals(Array.isArray(response.data) ? response.data.filter((goal) => goal && goal._id) : []);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setGoals([]);
      }
    };
    if (token) fetchGoals();
  }, [token]);

  const handleAddGoal = async (newGoal) => {
    try {
      const response = await axios.post("http://localhost:3000/goals/create", newGoal, {
        headers: { "x-access-token": token },
      });
      setGoals((prevGoals) => [...prevGoals, response.data.goal].filter((goal) => goal && goal._id));
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleUpdateGoal = async (id, currentAmount, monthlyInvestment) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/goals/update/${id}`,
        { currentAmount, monthlyInvestment },
        { headers: { "x-access-token": token } }
      );
      setGoals((prevGoals) =>
        prevGoals.map((g) => (g._id === id ? response.data.goal : g)).filter((goal) => goal && goal._id)
      );
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/goals/delete/${id}`, {
        headers: { "x-access-token": token },
      });
      setGoals((prevGoals) => prevGoals.filter((g) => g._id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-900 text-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 lg:mb-0">Financial Goals (India)</h1>
        <button
          onClick={() => setShowNewGoalForm(!showNewGoalForm)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_20px_rgba(139,92,246,0.7)] hover:scale-105"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Goal
        </button>
      </div>

      <GoalForm onAddGoal={handleAddGoal} showForm={showNewGoalForm} setShowForm={setShowNewGoalForm} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onUpdate={handleUpdateGoal} onDelete={handleDeleteGoal} />
          ))
        ) : (
          <div className="text-gray-400">No goals found</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
        <AIRecommendations goals={goals} investmentAmount={investmentAmount} />
        <ProjectionChart investmentAmount={investmentAmount} />
      </div>

      <FinancialMilestones goals={goals} />
    </div>
  );
}