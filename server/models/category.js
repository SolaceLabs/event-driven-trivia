const mongoose = require('mongoose');

const UniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String },
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

CategorySchema.virtual('no_of_trivias', {
  ref: 'Trivia',
  localField: 'name',
  foreignField: 'category',
  count: true // Set `count: true` on the virtual
});

CategorySchema.index({ name: 1 });
CategorySchema.plugin(UniqueValidator);

module.exports = mongoose.model('Category', CategorySchema);
