import express from 'express';
import { body } from 'express-validator';
import csrf from 'csurf';
import passport from 'passport';

import Order from '../models/order.js';
import Cart from '../models/cart.js';

const router = express.Router();
const csrfProtection = csrf();
router.use(csrfProtection);

// GET profile page
router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    console.log('trying to find orders');

    const orders = await Order.find({ user: req.user }).exec(); // Ensures a promise is returned

    if (!orders || orders.length === 0) {
      return res.end('No orders found!'); // Use `res.end` to send the response and end the request
    }

    orders.forEach((order) => {
      const cart = new Cart(order.cart); // Initialize cart with order's cart data
      order.items = cart.generateArray(); // Generate items array from cart
      order.totalPrice = order.cart.totalPrice; // Attach total price to order
    });

    res.render('user/profile', { orders }); // Render profile view with orders
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving orders!'); // Use `res.status` to return proper error status
  }
});

// GET logout
router.get('/logout', isLoggedIn, function (req, res, next) {
  req.logout(function logoutCallback(err) {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
});

router.use('/', notLoggedIn, function (req, res, next) {
  next();
});

// GET sign up page
router.get('/signup', function (req, res) {
  const messages = req.flash('error');
  res.render('user/signup', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

// POST sign up action route
router.post(
  '/signup',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 4 }),
  passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true,
  }),
  function (req, res) {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect('/user/profile');
    }
  },
);

// GET sign in page
router.get('/signin', function (req, res) {
  const messages = req.flash('error');
  res.render('user/signin', {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

// POST sign in action route
router.post(
  '/signin',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 4 }),
  passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true,
  }),
  function (req, res) {
    if (req.session.oldUrl) {
      console.log('old url triggered');

      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      console.log('new url triggered');

      res.redirect('/user/profile');
    }
  },
);

// module.exports = router;

export default router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
