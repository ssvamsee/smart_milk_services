// Import required packages
const express = require('express');
const bcrypt = require('bcrypt');

// Create the router
const router = express.Router();

// Import the User model
const User = require('../models/user');

// Import the token generator helper function
const generateResetToken = require('../helpers/tokenGenerator');

// Registration route
router.post('/register', async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      res.status(409).send('Username or email already exists.');
      return;
    }

    // Create a new user
    const newUser = new User({
      fullName,
      username,
      email,
      password
    });
    console.log({newUser});

    // Save the user to the database
    const savedUser = await newUser.save();
    console.log({savedUser})
    if (!savedUser) {
      throw new Error('Error saving user');
    }


    res.status(200).send('Registration successful!');
  } catch (error) {
    res.status(500).send('Error registering user.');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).send('Invalid password.');
      return;
    }

    // Set session data
    req.session.userId = user._id;

    res.status(200).send('Login successful!');
  } catch (error) {
    res.status(500).send('Error logging in.');
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // Clear session data
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Error logging out.');
      return;
    }
    res.status(200).send('Logout successful!');
  });
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).send('User not found.');
      return;
    }

    // Generate a reset token
    const resetToken = generateResetToken();

    // Set the reset token and expiration in the user document
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour

    // Save the user document
    await user.save();

    // Send the reset token to the user (e.g., via email)

    res.status(200).send('Reset token sent.');
  } catch (error) {
    res.status(500).send('Error sending reset token.');
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Find the user by reset token and expiration
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).send('Invalid or expired reset token.');
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    // Save the user document
    await user.save();

    res.status(200).send('Password reset successful!');
  } catch (error) {
    res.status(500).send('Error resetting password.');
  }
});

// Protected route
router.get('/profile', (req, res) => {
  // Check if user is authenticated
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Fetch user data from the database using req.session.userId

  res.status(200).send('Profile page');
});

// Export the router
module.exports = router;
