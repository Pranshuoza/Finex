const User = require('../Model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email }).select('-password');

        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        return res.json({ status: 'ok', profile: user });
    } catch (error) {
        console.error(error);
        res.json({ status: 'error', error: 'Invalid token' });
    }
};

const editProfile = async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const updates = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        user.name = updates.name || user.name;
        user.mobileNumber = updates.mobileNumber || user.mobileNumber;
        user.risk = updates.risk || user.risk;
        user.investmentGoal = updates.investmentGoal || user.investmentGoal;
        user.monthlyIncome = updates.monthlyIncome !== undefined ? updates.monthlyIncome : user.monthlyIncome;
        user.currentBalance = updates.currentBalance !== undefined ? updates.currentBalance : user.currentBalance;
        if (updates.password) {
            user.password = updates.password;
        }

        await user.save();
        return res.json({ status: 'ok', profile: user });
    } catch (error) {
        console.error(error);
        res.json({ status: 'error', error: 'Invalid token' });
    }
};

const changePassword = async (req, res) => {
    const token = req.headers['x-access-token'];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const { currentPassword, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', error: 'Current password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.json({ status: 'ok', message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.json({ status: 'error', error: 'Invalid token' });
    }
};

module.exports = { getProfile, editProfile, changePassword };
