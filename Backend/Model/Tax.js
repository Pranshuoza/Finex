const mongoose = require('mongoose')
const User = require('./User')

const taxSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    taxYear: { type: Number, required: true },
    userIncome: { type: Number, required: true },
    userDeductions: { type: Number, required: true },
    longTermCapitalGains: { type: Number, required: true, default: 0 },
    shortTermCapitalGains: { type: Number, required: true, default: 0 },
    dividendIncome: { type: Number, required: true, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    currentTax: { type: Number, required: true },
})