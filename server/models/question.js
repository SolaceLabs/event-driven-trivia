const mongoose = require('mongoose');

const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    category: { type: String, required: true },
    question: { type: String, required: true },
    choice_1: { type: String, required: true },
    choice_2: { type: String, required: true },
    choice_3: { type: String },
    choice_4: { type: String },
    answer: { type: String, required: true },
    owner: { type: 'ObjectId', ref: 'User' },
    deleted: { type: Boolean, default: false },
  }, {
    virtuals: {
      id: {
        get() {
          return this._id.toString();
        }
      }
    }
  }, {
    timestamps: true,
    autoIndex: true
  }
);

QuestionSchema.index({ question: 1, category: 1 });
QuestionSchema.set('toObject', { virtuals: true });
QuestionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', QuestionSchema);
