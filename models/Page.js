
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  lastcrawled: {
    type: Date,
    default: Date.now,
  },

  html: {
    type: String,
    required: true,
  },
  outgoingLinks: [
    {
      url: String,
      type: {
        type: String,
        enum: ['internal', 'external'],
      },
    },
  ],
  incomingLinks: [
    {
      type: String,
    },
  ],
  body: {
    type: String,
    required: true,
  },
  bodyOutgoingLinks: [
    {
      url: String,
      type: {
        type: String,
        enum: ['internal', 'external'],
      },
    },
  ],
  bodyIncomingLinks: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model('Page', pageSchema);
