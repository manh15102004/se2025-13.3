const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Tạo token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// Đăng ký người dùng
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    console.log('Register request:', { email, fullName, phone, role }); // Log để debug

    // Xác thực dữ liệu
    if (!email || !password || !fullName) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Kiểm tra xem người dùng đã tồn tại chưa
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

    // Tạo người dùng
    const user = await User.create({
      email,
      password,
      fullName,
      phone,
      role: role || 'buyer', // Mặc định là người mua nếu không được chỉ định
    });

    console.log('User created successfully:', email);

    // Tạo token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Registration error:', error); // Log lỗi đăng ký

    // Xử lý các lỗi cơ sở dữ liệu cụ thể
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

// Đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, passwordLength: password?.length }); // Log thử đăng nhập

    // Xác thực
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Tìm người dùng
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log('Login successful:', email);

    // Tạo token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during login',
    });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Cập nhật timestamp lần cuối truy cập
    await user.update({ lastSeen: new Date() });

    res.status(200).json({
      success: true,
      data: user.getPublicData(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật hồ sơ
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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

// Lấy hồ sơ người dùng
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'fullName', 'phone', 'address', 'avatar', 'role']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập bằng Facebook
exports.facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Facebook access token is required',
      });
    }

    // Xác thực token với Facebook Graph API
    const axios = require('axios');
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
    );

    const { id: facebookId, name, email, picture } = fbResponse.data;

    if (!facebookId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Facebook token',
      });
    }

    // Tìm hoặc tạo người dùng
    let user = await User.findOne({
      where: { facebookId },
    });

    if (!user && email) {
      // Kiểm tra xem người dùng có tồn tại với email này không
      user = await User.findOne({ where: { email } });

      if (user) {
        // Liên kết tài khoản Facebook với người dùng hiện tại
        user.facebookId = facebookId;
        if (!user.avatar || user.avatar.includes('placeholder')) {
          user.avatar = picture?.data?.url || user.avatar;
        }
        await user.save();
      }
    }

    if (!user) {
      // Tạo người dùng mới
      user = await User.create({
        email: email || `fb_${facebookId}@facebook.com`,
        password: Math.random().toString(36).slice(-8) + 'Fb!', // Mật khẩu ngẫu nhiên
        fullName: name || 'Facebook User',
        facebookId,
        avatar: picture?.data?.url || 'https://via.placeholder.com/150?text=User',
        role: 'buyer',
      });
    }

    // Tạo token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Facebook login successful',
      token,
      user: user.getPublicData(),
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || error.message || 'Facebook login failed',
    });
  }
};
