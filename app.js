/* eslint-disable no-unused-vars */
const {request, response} = require('express');
const express = require('express');
const app = express();
const csrf = require('tiny-csrf');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');

const bcyrpt = require('bcrypt');
const saltRounds = 10;

const flash = require('connect-flash');

app.use(express.urlencoded({extended: false}));
const path = require('path');

app.set('views',path.join(__dirname,'views'));

// seting the ejs is the engine
app.set('view engine', 'ejs');

// setting the css folder 
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(bodyParser.json());
app.use(cookieParser('ssh!!!! some secret string'));
app.use(csrf('this_should_be_32_character_long', ['POST', 'PUT', 'DELETE']));

app.use(session({
  secret:"this is my secret-122333444455555",
  cookie:{
    maxAge: 24 * 60 * 60 * 1000 // that will be equal to 24 Hours / A whole day
  }
}))

app.use(passport.initialize());
app.use(passport.session());
app.use((request, response, next)=>{
  response.locals.messages = request.flash();
  next();
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  password: 'password',
},(username, password, done) => {
  User.findOne({
    where:{
      email:username,
      
    }
  })
  .then(async(user) => {
    const result = await bcyrpt.compare(password, user.password);
    if(result){
      return done(null,user);
    } else{
      return done(null, false, {message: "Invalid Password"});
    }
  })
  .catch((error) => {
    console.error(error);
    return done(null,false,{
      message: "You are not a registered user",
    })

  })
}))

passport.serializeUser((user, done)=>{
  console.log("Serializing user in session",user.id)
  done(null,user.id);
});

passport.deserializeUser((id,done) => {
  User.findByPk(id)
  .then(user => {
    done(null, user)
  })
  .catch(error =>{
    done(error, null)
  })
})

app.get('/', async (request, response)=>{
    response.render('index', {
      title: 'Online Voting Platform',
      csrfToken: request.csrfToken(),
    });
});

module.exports = app;
