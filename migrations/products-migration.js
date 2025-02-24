const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../models/product');

dotenv.config();

mongoose.connect(process.env.MONGO_DB_URL);

const products = [
  new Product({
    imagePath: 'img url',
    title: 'Product Title',
    description: 'Product description goes here.',
    price: 10,
  }),
  new Product({
    imagePath: 'img url',
    title: 'Product Title',
    description: 'Product description goes here.',
    price: 50,
  }),
  new Product({
    imagePath: 'img url',
    title: 'Product Title',
    description: 'Product description goes here',
    price: 100,
  }),
];

let done = 0;

for (let i = 0; i < products.length; i++) {
  products[i].save(function (err, result) {
    done++;
    if (done === products.length) exit();
  });
}
function exit() {
  mongoose.disconnect();
}
