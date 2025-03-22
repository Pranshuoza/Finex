const User = require('../Model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ status: "error", error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: "error", error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "12h" }
        );

        return res.json({ status: "ok", user: token });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ status: "error", error: err.message });
    }
};


const login = async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return res.json({ status: 'error', error: 'Invalid login' });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        return res.json({ status: 'ok', user: token });
    } else {
        return res.json({ status: 'error', user: false });
    }
};

const verifyToken = (req, res) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.json({ status: 'error', error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ status: 'ok', decoded });
    } catch (error) {
        console.log(error);
        res.json({ status: 'error', error: 'Invalid or expired token' });
    }
};

module.exports = { register, login, verifyToken };
