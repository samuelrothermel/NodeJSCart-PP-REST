import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  imagePath: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

// Use ES Module syntax to export
const Product = mongoose.model('Product', schema);
export default Product;
