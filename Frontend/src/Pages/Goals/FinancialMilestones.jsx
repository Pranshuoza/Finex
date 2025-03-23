import { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, TrendingUp } from "lucide-react";

export default function FinancialMilestones({ goals }) {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const calculateMilestones = () => {
      const sortedGoals = [...goals].sort((a, b) => (b.currentAmount || 0) / b.goalAmount - (a.currentAmount || 0) / a.goalAmount);
      const newMilestones = sortedGoals.slice(0, 3).map((goal) => {
        const progressPercentage = ((goal.currentAmount || 0) / goal.goalAmount) * 100;
        const monthsToGoal = Math.max(
          0,
          Math.round(
            (new Date(goal.goalDate) - new Date()) / (1000 * 60 * 60 * 24 * 30) -
              (goal.currentAmount || 0) / (goal.goalAmount / ((new Date(goal.goalDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
          )
        );
        let message = "";
        if (goal.completed) message = "Goal completed!";
        else if (monthsToGoal < 0) message = `Behind schedule by ${-monthsToGoal} months. Increase contributions.`;
        else message = `On track to complete ${monthsToGoal} months ${monthsToGoal > 0 ? "ahead" : "on"} schedule!`;

        return {
          goalName: goal.goalName,
          progressPercentage,
          message,
        };
      });
      setMilestones(newMilestones);
    };

    calculateMilestones();
  }, [goals]);

  return (
    <div className="relative bg-gradient-to-bl from-violet-900/50 via-gray-900/80 to-purple-900/50 p-5 rounded-xl overflow-hidden mt-6">
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-bl from-violet-500/20 via-purple-500/10 to-indigo-500/20"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-400" />
            Financial Milestones
          </h3>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center">
            View All
            <ChevronDown className="h-3 w-3 ml-1" />
          </button>
        </div>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium">
                    {milestone.goalName}: {milestone.progressPercentage.toFixed(0)}% Complete
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{milestone.message}</p>
                </div>
              </div>
              <div className="mt-3 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  style={{ width: `${milestone.progressPercentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}