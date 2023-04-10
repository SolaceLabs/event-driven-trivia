const mongoose = require('mongoose');

const { Schema } = mongoose;

const answerSchema = new Schema({
  player: String, qno: Number, qid: String, answered: Boolean, answer: String, correct: Boolean, timing: Number, score: Number
});
const scoreSchema = new Schema({
  player: String, corrects: Number, answered: Number, timing: Number, score: Number, rank: Number, name: String, email: String
});

const TriviaStatsSchema = new Schema(
  {
    hash: { type: String, required: true },
    trivia: { type: 'ObjectId', ref: 'Trivia' },
    questions: [{ type: 'ObjectId', ref: 'Question' }],
    answers: [answerSchema],
    score: [scoreSchema]
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

TriviaStatsSchema.virtual('name', {
  ref: 'Trivia',
  localField: 'name',
  foreignField: 'name',
});
TriviaStatsSchema.virtual('no_of_questions', {
  ref: 'Trivia',
  localField: 'no_of_questions',
  foreignField: 'no_of_questions',
  count: true // Set `count: true` on the virtual
});
TriviaStatsSchema.virtual('status', {
  ref: 'Trivia',
  localField: 'status',
  foreignField: 'status',
});
TriviaStatsSchema.set('toObject', { virtuals: true });
TriviaStatsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TriviaStats', TriviaStatsSchema);
