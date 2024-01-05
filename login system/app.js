const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const passportLocalMongoose = require('passport-local-mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');  
const Alumni = require('./public/models/user');
const config = require('./config.json');

const app = express(); 

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public', 'views')));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'natsIsSoCoolOmgLmaoYouHaveNoClue',  
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

passport.use(new LocalStrategy(Alumni.authenticate()));

passport.serializeUser(Alumni.serializeUser());
passport.deserializeUser(Alumni.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  callbackURL: 'your-callback-url',
},
(accessToken, refreshToken, profile, done) => {
  // Check if the user already exists in your database
  // If not, create a new user based on the Google profile information
  // Call done() with the user object
}));


app.get("/login", function(req, res){
    try {
        res.render('./login');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('<IDK>');
  }
);

app.get('/logout. ',async (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.post("/login", function(req, res){

});

app.get("/register", function(req, res){
    try {
        res.render('./register');
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
});

app.post("/register", function(req, res){
  const { username, password } = req.body;
  User.register(new User({ username: username }), password, function(err, user){
      if(err){
          console.log(err);
          res.redirect("/register");
      } else {
          passport.authenticate("local")(req, res, function(){
              res.redirect("<IDK YET>");
          });
      }
  });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });