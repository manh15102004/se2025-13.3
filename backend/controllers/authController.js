const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    console.log('Register request:', { email, fullName, phone }); // Debug

    // Validation
    if (!email || !password || !fullName) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      phone,
    });

    console.log('User created successfully:', email);

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Registration error:', error); // Debug

    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Validation error',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during registration',
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length }); // Debug

    // Validation
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No'); // Debug

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch); // Debug

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user.id);
    console.log('Login successful for user:', email); // Debug

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Login error:', error); // Debug
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current logged in user
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    console.log('getCurrentUser - userId:', userId); // Debug

    const user = await User.findByPk(userId);

    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.getPublicData(),
    });
  } catch (error) {
    console.error('getCurrentUser error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, avatar } = req.body;
    const userId = req.user?.id || req.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getPublicData(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
