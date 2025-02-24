import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  cart: { type: Object, required: true },
  address: { type: String, required: true },
  name: { type: String, required: true },
  paymentId: { type: String, required: true },
});

// Use ES Module syntax to export
const Order = mongoose.model('Order', schema);
export default Order;
