// Handles registration, login, current user, profile update and password change.
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { httpError, asyncHandler } = require('../utils/httpError');

// Only send safe fields to the frontend (never the password hash)
const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  studentId: u.studentId,
  role: u.role,
  createdAt: u.createdAt,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDENT_ID_REGEX = /^[A-Za-z0-9\-\/]{3,20}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/; // 6+ chars, at least one letter and one number

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, studentId, password, confirmPassword } = req.body;
  if ([name, email, studentId, password].some((v) => typeof v !== 'string')) throw httpError(400, 'Please fill in all fields.');

  if (!name || name.length < 2) throw httpError(400, 'Please enter your full name.');
  if (!email || !EMAIL_REGEX.test(email)) throw httpError(400, 'Please enter a valid college email.');
  if (!studentId || !STUDENT_ID_REGEX.test(studentId)) throw httpError(400, 'Student ID must be 3-20 letters, numbers, "-" or "/".');
  if (!password || !PASSWORD_REGEX.test(password)) throw httpError(400, 'Password must be at least 6 characters and include a letter and a number.');
  if (confirmPassword !== undefined && password !== confirmPassword) throw httpError(400, 'Passwords do not match.');

  const domain = (process.env.ALLOWED_EMAIL_DOMAIN || '').toLowerCase();
  if (domain && !email.toLowerCase().endsWith(`@${domain}`)) {
    throw httpError(400, `Please use your college email (@${domain}).`);
  }

  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'This email is already registered.');
  if (await User.findOne({ studentId: studentId.toUpperCase() })) throw httpError(409, 'This student ID is already registered.');

  // role is ALWAYS "student" here - nobody can register as admin through the API
  const user = await User.create({ name, email, studentId, password, role: 'student' });

  res.status(201).json({ success: true, message: 'Registration successful', token: generateToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Please enter your email and password.');
  // Only plain text is accepted (blocks objects such as {"$gt": ""} used in NoSQL injection)
  if (typeof email !== 'string' || typeof password !== 'string') throw httpError(400, 'Invalid email or password format.');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  // Same message for "no user" and "wrong password" so attackers cannot guess which emails exist
  if (!user || !(await user.matchPassword(String(password)))) throw httpError(401, 'Invalid email or password.');

  res.json({ success: true, message: 'Login successful', token: generateToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

// PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, studentId } = req.body;
  if (name !== undefined) {
    if (name.length < 2) throw httpError(400, 'Name must be at least 2 characters.');
    req.user.name = name;
  }
  if (studentId !== undefined) {
    if (!STUDENT_ID_REGEX.test(studentId)) throw httpError(400, 'Student ID must be 3-20 letters, numbers, "-" or "/".');
    const taken = await User.findOne({ studentId: studentId.toUpperCase(), _id: { $ne: req.user._id } });
    if (taken) throw httpError(409, 'This student ID is already registered.');
    req.user.studentId = studentId;
  }
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', user: publicUser(req.user) });
});

// PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw httpError(400, 'Please fill in all password fields.');
  if (!PASSWORD_REGEX.test(newPassword)) throw httpError(400, 'New password must be at least 6 characters and include a letter and a number.');

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(String(currentPassword)))) throw httpError(401, 'Current password is incorrect.');

  user.password = newPassword; // hashed automatically by the pre-save hook
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});
