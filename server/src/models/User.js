const mongoose = require('mongoose');

// Collection: users  ->  id, full_name, email, password_hash, created_at
const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true, // unique index -> duplicate emails are rejected by the database itself
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password_hash: { type: String, required: true, select: false }, // never loaded by default
    created_at: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      // Safe serialisation: expose "id", hide _id and password_hash always
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
