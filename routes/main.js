import express from 'express';
const router = express.Router();

import Product from '../models/product.js';

// GET home page
router.get('/', async function getMainPage(req, res, next) {
  const successMgs = req.flash('success')[0];

  const products = await Product.find().lean();

  res.render('shop/index', {
    title: 'Shopping cart',
    products,
    successMgs: successMgs,
    noMessage: !successMgs,
  });
});

export default router;
