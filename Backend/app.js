require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const socialAuthRoutes = require('./Routes/socialAuthRoute');
const transactionRoutes = require("./Routes/transactionRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const taxRoutes = require("./Routes/taxRoutes");
const goalRoutes = require("./Routes/goalRoutes");
const stockRoutes = require("./Routes/stockRoutes");
const upstoxRoutes = require("./Routes/upstoxRoutes");

const MONGO_URL = process.env.MONGO_URL;
const passport = require('./Utils/passportConfig');
const session = require('express-session');
const { inngest } = require("./Utils/AI/client");
const { serve } = require("inngest/express");
const { generateMonthlyReports } = require("./Utils/AI/generateMonthlyReports");

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connection open at: ", MONGO_URL);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use('/api/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/auth', socialAuthRoutes);
app.use('/transactions', transactionRoutes);
app.use("/api/inngest", serve({ client: inngest, functions: [generateMonthlyReports] }));
app.use('/tax', taxRoutes);
app.use('/chat', chatRoutes); 
app.use('/goals', goalRoutes);
app.use('/stocks', stockRoutes);
app.use("/upstox", upstoxRoutes);

app.listen(3000, () => {
  console.log('Server started on 3000');
});
