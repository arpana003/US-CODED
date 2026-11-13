import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TeamMember from '../models/TeamMember.js';

const JWT_SECRET = process.env.JWT_SECRET || 'uscoded_jwt_super_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @route   POST /api/auth/register
// @access  Public — always creates 'employee' role
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Public registration is always employee — admins are created by existing admins only
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'employee',
    });

    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      success: true,
      message: 'Account created. Welcome to US-CODED!',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, designation: user.designation },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, loginMode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role-mode validation
    if (loginMode === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This account does not have admin access. Please use Employee Login.',
      });
    }
    if (loginMode === 'employee' && user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts must use Admin Login.',
      });
    }

    const token = generateToken(user._id, user.role);
    return res.status(200).json({
      success: true,
      message: 'Welcome back to US-CODED.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        designation: user.designation || '',
        teamMemberId: user.teamMemberId || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('teamMemberId', 'name email role projects');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    return res.status(200).json({
      success: true,
      message: 'If an account exists with that email, password reset instructions have been sent.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/create-employee
// @access  Admin only
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, designation, projectIds } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create linked TeamMember record
    const teamMember = await TeamMember.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: designation || 'Team Member',
      projects: projectIds || [],
    });

    // Create the User account linked to TeamMember
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'employee',
      designation: designation || '',
      teamMemberId: teamMember._id,
    });

    return res.status(201).json({
      success: true,
      message: `Employee account created for ${name}.`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, teamMemberId: user.teamMemberId },
      teamMember: { id: teamMember._id, name: teamMember.name },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
