import passport from 'passport';
import User from '../models/user.js';
import { Strategy as LocalStrategy } from 'passport-local';
import { validationResult } from 'express-validator';

const ERRORS_MESSAGES = {
  email: "Email is invalid",
  password: "Password should be 4 symbols min",
};

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id); // Fetch the user asynchronously by ID
    return done(null, user); // Call `done` with the user if found
  } catch (err) {
    return done(err); // Pass any errors to `done`
  }
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function signUp(req, email, password, done) {
      try {
        // Step 1: Validate input
        const { errors } = validationResult(req);
    
        if (errors.length) {
          const messages = errors.map(error => ERRORS_MESSAGES[error.param]);
          return done(null, false, req.flash("error", messages)); // Return errors if found
        }
    
        // Step 2: Check if user already exists
        const user = await User.findOne({ email: email });
        if (user) {
          return done(null, false, { message: "Email is already in use." });
        }
    
        // Step 3: Create and save new user
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password); // Encrypt password
    
        await newUser.save(); // Save user asynchronously
        return done(null, newUser); // Return the newly created user
      } catch (err) {
        return done(err); // Catch and return any errors
      }
    }
  ),
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function signIn(req, email, password, done) {
      try {
      const { errors } = validationResult(req);

      if (errors.length) {
        const messages = [];

        errors.forEach(function (error) {
          console.log(ERRORS_MESSAGES[error.param]);
          messages.push(ERRORS_MESSAGES[error.param]);
        });

        return done(null, false, req.flash("error", messages));
      }

      try {
        console.log('sign in triggered');
        
        const user = await User.findOne({ email: email }); // Fetch user asynchronously
        const message = { message: "Wrong email or password" };
      
        if (!user) {
          return done(null, false, message); // If user is not found
        }
      
        if (!user.validPassword(password)) {
          return done(null, false, message); // If password is incorrect
        }
      
        return done(null, user); // If everything is correct, return the user
      } catch (err) {
        return done(err); // Handle any errors
      }
      
      } catch (err) {
        return done(err); // Catch and return any errors
      }

    },
  ),
);
