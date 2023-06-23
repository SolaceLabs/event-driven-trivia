const mongoose = require('mongoose');

const { Schema } = mongoose;

const chatSchema = new Schema({
  name: String, message: String, emoji: Boolean, timestamp: Date
});

const eventSchema = new Schema({
  action: String, axis: Number, background: String, category: String, topic: String, ts: Date
});

const TriviaStatsSchema = new Schema(
  {
    hash: { type: String, required: true },
    trivia: { type: 'ObjectId', ref: 'Trivia' },
    events: [eventSchema],
    chat: [chatSchema]
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

TriviaStatsSchema.set('toObject', { virtuals: true });
TriviaStatsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TriviaStats', TriviaStatsSchema);
