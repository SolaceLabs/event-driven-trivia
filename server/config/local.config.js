const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Local Strategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    // Match User
    User.findOne({ email })
      .then(user => {
        // Create new User
        if (!user) {
          const newUser = new User({ email, password });
          // Hash password before saving in database
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err1, hash) => {
              if (err1) throw err1;
              newUser.password = hash;
              newUser
                .save()
                .then((user1) => done(null, user1))
                .catch(err2 => done(null, false, { message: err2 }));
            });
          });
          // Return other user
        } else {
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            }
            return done(null, false, { message: 'Wrong password' });
          });
        }
      })
      .catch(err => done(null, false, { message: err }));
  })
);
