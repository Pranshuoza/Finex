const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema({
    goalName: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    goalDate: { type: Date, required: true },
    currentAmount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    description: { type: String },
})

module.exports = mongoose.model('Goal', goalSchema)