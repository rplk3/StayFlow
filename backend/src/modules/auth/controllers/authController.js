const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'stayflow_super_secret', { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ firstName, lastName, email, password });

        if (user) {
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
};

// @desc    Get user profile (current logic based on JWT token)
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
};

// @desc    Register a new admin (pending approval)
// @route   POST /api/auth/admin-register
// @access  Public
exports.registerAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // If no approved admins exist yet, auto-approve as Super Admin
        const approvedAdminCount = await User.countDocuments({ role: 'admin', adminStatus: 'approved' });
        const status = approvedAdminCount === 0 ? 'approved' : 'pending';

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'admin',
            adminStatus: status
        });

        if (user) {
            res.status(201).json({
                message: 'Admin registration successful. Awaiting Super Admin approval.',
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                adminStatus: user.adminStatus,
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (err) {
        console.error('Admin Registration Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
};

// @desc    Authenticate an admin
// @route   POST /api/auth/admin-login
// @access  Public
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.role !== 'admin') {
            return res.status(401).json({ message: 'This account is not an admin account. Please use the user login.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.adminStatus !== 'approved') {
            return res.status(403).json({ message: 'Your admin account is pending approval by the Super Admin.' });
        }

        res.json({
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            adminStatus: user.adminStatus,
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error('Admin Login Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
};

// @desc    Get all pending admin registrations
// @route   GET /api/auth/pending-admins
// @access  Private (Super Admin only)
exports.getPendingAdmins = async (req, res) => {
    try {
        // Verify the requester is an approved admin
        if (req.user.role !== 'admin' || req.user.adminStatus !== 'approved') {
            return res.status(403).json({ message: 'Not authorized. Super Admin access required.' });
        }

        const pendingAdmins = await User.find({ role: 'admin', adminStatus: 'pending' }).select('-password');
        res.json(pendingAdmins);
    } catch (err) {
        console.error('Get Pending Admins Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Approve a pending admin
// @route   PUT /api/auth/approve-admin/:id
// @access  Private (Super Admin only)
exports.approveAdmin = async (req, res) => {
    try {
        // Verify the requester is an approved admin
        if (req.user.role !== 'admin' || req.user.adminStatus !== 'approved') {
            return res.status(403).json({ message: 'Not authorized. Super Admin access required.' });
        }

        const admin = await User.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.role !== 'admin') {
            return res.status(400).json({ message: 'This user is not an admin' });
        }

        admin.adminStatus = 'approved';
        await admin.save();

        res.json({ message: 'Admin approved successfully', admin: { _id: admin.id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email, adminStatus: admin.adminStatus } });
    } catch (err) {
        console.error('Approve Admin Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
