
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      email,
      password: hashedPassword,
      verificationToken,
    });
    await user.save();

    sendVerificationEmail(user.email, verificationToken);


   

    res.status(201).json({ message: 'User registered successfully. Check your email for verification.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function sendVerificationEmail(email, token) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password', // Replace with your email password
      },
    });

    const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
        to: email,
        subject: 'Task Management App - Email Verification',
        text: `Click the following link to verify your email: http://localhost:3000/verify/${token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

    router.get('/verify/:token', async (req, res) => {
        try {
          const token = req.params.token;
          const user = await User.findOne({ verificationToken: token });
      
          if (!user) {
            return res.status(400).json({ error: 'Invalid verification token' });
          }
      
          // Update user's verification status
          user.isVerified = true;
          user.verificationToken = undefined;
          await user.save();
      
          res.json({ message: 'Email verification successful. You can now login.' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });

      

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id, role: user.role }, 'your-secret-key', {
        expiresIn: '1h',
      });
  
      res.json({ token, userId: user._id, role: user.role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
