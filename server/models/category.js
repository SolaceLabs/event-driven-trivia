const mongoose = require('mongoose');

const UniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String },
    owner: { type: 'ObjectId', ref: 'User' },
    shared: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    autoIndex: true
  }
);

CategorySchema.virtual('no_of_questions', {
  ref: 'Question',
  localField: 'name',
  foreignField: 'category',
  count: true // Set `count: true` on the virtual
});

CategorySchema.virtual('no_of_deleted_questions', {
  ref: 'Question',
  localField: 'name',
  foreignField: 'category',
  count: true, // Set `count: true` on the virtual
  match: { deleted: true }
});

CategorySchema.index({ name: 1 });
CategorySchema.plugin(UniqueValidator);

module.exports = mongoose.model('Category', CategorySchema);
