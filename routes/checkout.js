import express from 'express';
import Order from '../models/order.js';
import Cart from '../models/cart.js';
import { paypalClientID } from '../config/env.js';
import {
  createCheckoutOrder,
  createAccelOrder,
  captureOrder,
} from '../services/paypalService.js';

const router = express.Router();

router.get('/checkout', isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    console.log('No Cart session found. Redirecting to home page.');
    return res.redirect('/');
  }
  const cart = new Cart(req.session.cart);
  // console.log('Created new Cart object using contents of session:');
  // console.log(req.session);
  const errMsg = req.flash('error')[0];
  return res.render('shop/checkout', {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg,
    paypalClientID: paypalClientID, // Pass PayPal Client ID for front-end
  });
});

router.post('/api/orders', async (req, res) => {
  console.log('Received POST request to /api/orders');
  console.log('Request body:', req.body);
  if (!req.session.cart) {
    return res.status(400).json({ error: 'No cart found in session' });
  }

  const cart = new Cart(req.session.cart);
  const shippingAddress = req.body.shippingAddress;
  try {
    let jsonResponse;
    if (shippingAddress) {
      jsonResponse = await createCheckoutOrder(cart, shippingAddress);
    } else {
      jsonResponse = await createAccelOrder(cart);
    }
    console.log('Response from PayPal API:', jsonResponse);
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    const jsonResponse = await captureOrder(orderID);
    if (jsonResponse.id) {
      const cart = new Cart(req.session.cart);
      const payer = jsonResponse.payer;
      const shipping = jsonResponse.purchase_units[0].shipping;

      const order = new Order({
        user: req.user,
        cart: cart,
        address: `${shipping?.address?.address_line_1}, ${shipping?.address?.admin_area_2}, ${shipping?.address?.country_code}`,
        name: `${payer?.name?.given_name} ${payer?.name?.surname}`,
        paymentId: jsonResponse.id,
      });

      await order.save();
      req.flash('success', 'Successfully bought product!');
      req.session.cart = null;
      res.json(jsonResponse);
    } else {
      res.status(500).json({ error: 'Capture failed' });
    }
  } catch (error) {
    console.error('Error capturing order:', error);
    res.status(500).json({ error: error.message });
  }
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}

export default router;
