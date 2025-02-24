import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = [
  new Product({
    imagePath: 'https://m.media-amazon.com/images/I/61T+QOLlemL.jpg',
    title: 'Yogasleep Dohm Classic (Tan) The Original White Noise Machine',
    description: 'Classic White Noise Generator.',
    price: 20,
  }),
  new Product({
    imagePath:
      'https://i5.walmartimages.com/seo/LectroFan-EVO-Fan-Sound-White-Noise-Sound-Machine-High-Fidelity-Model-ASM1020-WW-White_d1e1ca70-e1dc-44fd-9182-aae3c693ba44.46ee627848ca7123b987d5e7a09d0b81.jpeg',
    title: 'LectroFan EVO Fan Sound and White Noise Machine',
    description: 'Adjustable White Noise Generator.',
    price: 40,
  }),
  new Product({
    imagePath: 'https://m.media-amazon.com/images/I/71L9YvdXUmL.jpg',
    title: 'SNOOZ White Noise Sound Machine',
    description: 'Smart White Noise Generator.',
    price: 50,
  }),
];

async function saveProducts() {
  for (let product of products) {
    await product.save();
  }
  mongoose.disconnect();
}

saveProducts().catch(err => {
  console.error(err);
  mongoose.disconnect();
});
