const mongoose = require('mongoose');
const UniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    id: { type: String, default: null },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    email_is_verified: { type: Boolean, default: false },
    password: { type: String, required: true },
    lastVisited: { type: Date }
  },
  {
    timestamps: true,
    autoIndex: true
  }
);

UserSchema.index({ email: 1 });
UserSchema.plugin(UniqueValidator);

module.exports = mongoose.model('User', UserSchema);
