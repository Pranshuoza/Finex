const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goalName: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    goalDate: { type: Date, required: true },
    currentAmount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    description: { type: String },
    monthlyInvestment: { type: Number, default: 0 }, 
});

module.exports = mongoose.model('Goal', goalSchema);