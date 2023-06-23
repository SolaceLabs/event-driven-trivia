const mongoose = require('mongoose');

const { Schema } = mongoose;
const playerSchema = new Schema({
  names: [String], connected: [String], current: Number, high: Number, timestamp: Date
});

const winnerSchema = new Schema({
  player: String, corrects: Number, answered: Number, timing: Number, score: Number, rank: Number, name: String, email: String
});
const questionSchema = new Schema({
  qid: String, category: String, question: String, choice_1: String, choice_2: String, choice_3: String, choice_4: String, answer: String
});

const answerSchema = new Schema({
  player: String, qno: Number, qid: String, answered: Boolean, answer: String, correct: Boolean, timing: Number, score: Number
});
const scoreSchema = new Schema({
  player: String, corrects: Number, answered: Number, timing: Number, score: Number, rank: Number
});

const TriviaSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    audience: { type: String, required: true },
    category: { type: String, required: true },
    questions: [questionSchema],
    no_of_questions: { type: Number, required: true },
    time_limit: { type: Number, required: true },
    scheduled: { type: Boolean, required: false },
    start_at: { type: Date, required: false },
    close_at: { type: Date, required: false },
    mode: { type: String, default: 'RANDOM', required: false },
    players: { type: playerSchema },
    status: { type: String, required: true }, // NEW, READY, SCHEDULED, EXPIRED, COMPLETED, ABORTED
    owner: { type: 'ObjectId', ref: 'User' },
    shared: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    hash: { type: String },
    adminHash: { type: String },
    collect_winners: { type: Boolean, required: false },
    no_of_winners: { type: Number, default: 0 },
    winners: [winnerSchema],
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

TriviaSchema.index({
  name: 1, category: 1, status: 1, audience: 1
});

TriviaSchema.set('toObject', { virtuals: true });
TriviaSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Trivia', TriviaSchema);
