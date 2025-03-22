const { inngest } = require("./client"); 
const { getMonthlyStats, generateFinancialInsights } = require("./monthlyReportService");
const { sendEmail } = require("../mailService");
const User = require("../../Model/User");

exports.generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, 
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await User.find().select("name email");
    });

    for (const user of users) {
      await step.run(`generate-report-${user._id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthName = lastMonth.toLocaleString("default", { month: "long" });

        // Fetch financial stats
        const stats = await getMonthlyStats(user._id, lastMonth);
        
        // AI-generated insights
        const insights = await generateFinancialInsights(stats, monthName);

        // Prepare email content with inline styling
        const emailHTML = `
          <div style="font-family: 'Inter', Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; text-align: center; font-size: 28px; font-weight: 700; margin-bottom: 20px; background: linear-gradient(90deg, #1f2937, #4b5563); -webkit-background-clip: text; color: transparent;">Your Monthly Financial Report - ${monthName}</h2>
            <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 15px;">Hello <strong style="color: #1f2937;">${user.name}</strong>,</p>
            <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 20px;">Here’s your financial summary for <strong style="color: #1f2937;">${monthName}</strong>:</p>
            <ul style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); list-style: none; margin-bottom: 25px;">
              <li style="font-size: 16px; color: #374151; margin-bottom: 12px;"><strong style="color: #22c55e;">Total Income:</strong> ₹${stats.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</li>
              <li style="font-size: 16px; color: #374151; margin-bottom: 12px;"><strong style="color: #ef4444;">Total Expenses:</strong> ₹${stats.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</li>
              <li style="font-size: 16px; color: #374151;"><strong style="color: ${stats.totalIncome - stats.totalExpenses >= 0 ? '#22c55e' : '#ef4444'};">Net Income:</strong> ₹${(stats.totalIncome - stats.totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</li>
            </ul>
            <h3 style="color: #16a085; font-size: 20px; font-weight: 600; margin-bottom: 15px;">AI Insights:</h3>
            <ol style="padding-left: 30px; margin-bottom: 25px;">
              <li style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 10px; position: relative; padding-left: 15px;">
                <span style="position: absolute; left: 0; color: #16a085; font-weight: bold;"></span> ${insights[0]}
              </li>
              <li style="font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 10px; position: relative; padding-left: 15px;">
                <span style="position: absolute; left: 0; color: #16a085; font-weight: bold;"></span> ${insights[1]}
              </li>
              <li style="font-size: 14px; color: #4b5563; line-height: 1.6; position: relative; padding-left: 15px;">
                <span style="position: absolute; left: 0; color: #16a085; font-weight: bold;"></span> ${insights[2]}
              </li>
            </ol>
            <p style="text-align: center; font-size: 16px; color: #1f2937; margin-top: 20px; font-weight: 600;">
              <strong>Stay financially smart!</strong>
            </p>
          </div>
        `;

        // Send email
        await sendEmail(user.email, `Your Monthly Financial Report - ${monthName}`, emailHTML);
      });
    }

    return { processed: users.length };
  }
);
