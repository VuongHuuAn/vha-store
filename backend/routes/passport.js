const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const mongoose = require('mongoose');
require('dotenv').config();


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://vha-store.vercel.app/auth/google/callback",
      //  "/auth/google/callback"||
      scope: ['profile', 'email'],
      
    
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        
        // Tìm user theo googleId hoặc email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: email }
          ]
        });

        if (user) {
          // Cập nhật thông tin Google nếu user đăng nhập bằng email trước đó
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        // Tạo user mới với thông tin từ Google
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          password: `google-${profile.id}-${Date.now()}`, // Password ngẫu nhiên
          type: 'user'
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
module.exports = passport;