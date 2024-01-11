const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('./public/models/user');
const config = require('./config.json');

const app = express();

app.set('view engine', 'ejs');
app.set('views', './public/views');

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const dbUrl = config.mongoURL;
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: 'http://localhost:3000/login/google/callback',
},
async (accessToken, refreshToken, profile) => {
  console.log('Google Strategy Initialized');
  try {
    const lastUser = await User.findOne({}, {}, { sort: { 'sahitiID': -1 } });

    let nextSahitiID = 10000;
    if (lastUser) {
      nextSahitiID = lastUser.sahitiID + 1;
    }

    const user = await User.findOne({ 'sahitiID': profile.id });

    if (!user) {
      const newUser = new User({
        sahitiID: nextSahitiID,
        name: profile.displayName,
        username: profile.emails[0].value, 
        college: '',
        contactNumber: '',
      });

      await newUser.save();
      return newUser;
    } else {
      return user;
    }
  } catch (err) {
    throw err;
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const isAuthenticated = (req, res, next) => {
  console.log('isAuthenticated middleware');
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};


app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log('Step 1: Callback reached');
    res.redirect('/register');
  },
  (err, req, res, next) => {
    console.error(err);
    res.redirect('/');
  }
);


app.get('/logout', (req, res) => {
  req.logout();
  console.log('Step 2: User logged out');
  res.redirect('/');
});

app.get('/register', isAuthenticated, (req, res) => {
  console.log('Step 3: Register route accessed');
  res.render('register');
});

app.post('/register', isAuthenticated, (req, res) => {
  console.log('Step 4: Register form submitted');
  const { college, contactNumber, nitc } = req.body;

  const user = req.user;

  user.contactNumber = contactNumber;
  user.NITC = nitc === 'true'; 
  user.college = user.NITC ? 'NITC' : college;
  user.registered = 1;

  user.save((err) => {
    if (err) {
      console.log('Step 5: Error saving user:', err);
      res.redirect('/register');
    } else {
      console.log('Step 6: User registered successfully');
      res.redirect('/dashboard');
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
