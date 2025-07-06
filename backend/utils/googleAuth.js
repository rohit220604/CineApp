const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      let baseUsername = profile.displayName.replace(/\W/g, '').toLowerCase();
      let username = baseUsername;
      let count = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${count++}`;
      }
      user = await User.create({
        username,
        email: profile.emails[0].value,
        isVerified: true,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, done));

function setupGoogleAuthRoutes(app) {
  app.use(passport.initialize());

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] , session: false})
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' ,session: false}),
    (req, res) => {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    }
  );
}

module.exports = { setupGoogleAuthRoutes };
