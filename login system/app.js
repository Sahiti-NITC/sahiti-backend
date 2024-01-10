const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const Alumni = require('./public/models/user');
const config = require('./config.json');

const app = express();

app.set('view engine', 'ejs');
app.use(session({
  secret: 'config.sessionSecret',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const dbUrl = config.mongoURL;
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.google.callbackURL,
},
(accessToken, refreshToken, profile, done) => {
  Alumni.findOne({ 'sahitiID': profile.id }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      const newUser = new Alumni({
        sahitiID: profile.id,
        name: profile.displayName,
        college: '', 
        contactNumber: '', 
      });

      newUser.save((err) => {
        if (err) {
          return done(err);
        }
        return done(null, newUser);
      });
    } else {
      return done(null, user);
    }
  });
}));

passport.serializeUser(Alumni.serializeUser());
passport.deserializeUser(Alumni.deserializeUser());

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard'); 
  }
);

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/register');
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/register', isAuthenticated, (req, res) => {
  res.render('register');
});

app.post('/register', isAuthenticated, (req, res) => {
  const { college, contactNumber } = req.body;

  const user = req.user;

  user.college = college;
  user.contactNumber = contactNumber;

  user.save((err) => {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      res.redirect('/dashboard'); 
    }
  });
});

app.get('/test', isAuthenticated, (req, res) => {
  console.log('TEST');
  res.send('Test route');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
