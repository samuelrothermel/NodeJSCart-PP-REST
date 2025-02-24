import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcrypt from 'bcrypt-nodejs';

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Use ES Module syntax to export
const User = mongoose.model('User', userSchema);
export default User;
