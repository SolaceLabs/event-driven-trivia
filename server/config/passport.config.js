const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passportJWT = require('passport-jwt');
const User = require('../models/user');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

require('dotenv').config();

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, ((email, password, cb) =>
  // this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
  // eslint-disable-next-line implicit-arrow-linebreak
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return cb(null, false, { message: 'Incorrect email, could not locate a valid account associated with the email.' });
      }

      return bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          return cb(null, user, { message: 'Logged In Successfully' });
        }
        return cb(null, false, { message: 'Password incorrect' });
      });
    })
    .catch(err => cb(err))
)
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TRIVIA_SECRET,
}, ((jwtPayload, cb) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  User.findOneById(jwtPayload.id)
    .then(user => cb(null, user))
    .catch(err => cb(err))
)
));
