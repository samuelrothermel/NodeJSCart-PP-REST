import express from 'express';
import { paypalClientID } from '../config/env.js';

const router = express.Router();

import Cart from '../models/cart.js';
import Product from '../models/product.js';

// Asynchronous version since previous resulted in 'no more callbacks' error
router.get('/cart/add-to-cart/:id', async (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  try {
    const product = await Product.findById(productId); // Fetch product asynchronously
    if (!product) {
      return res.redirect('/');
    }
    cart.add(product, product.id); // Add product to cart
    req.session.cart = cart; // Store updated cart in session
    console.log(req.session.cart); // Log session cart
    res.redirect('/'); // Redirect to home page
  } catch (err) {
    console.error(err);
    res.redirect('/'); // Handle error by redirecting
  }
});

router.get('/cart/reduce/:id', function (req, res) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/cart');
});

router.get('/cart/remove/:id', function (req, res) {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/cart');
});

router.get('/cart', function (req, res) {
  if (!req.session.cart) {
    return res.render('shop/cart', { products: null });
  }

  const cart = new Cart(req.session.cart);
  return res.render('shop/cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    paypalClientID: paypalClientID,
  });
});

router.post('/cart/update-shipping', function (req, res) {
  if (!req.session.cart) {
    return res.status(400).json({ error: 'No cart found in session' });
  }

  const cart = new Cart(req.session.cart);
  const shippingCost = parseFloat(req.body.shippingCost);
  cart.totalPrice += shippingCost;
  req.session.cart = cart;
  res.json({ totalPrice: cart.totalPrice });
});

export default router;
