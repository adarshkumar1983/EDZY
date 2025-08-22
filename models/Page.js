
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
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
});

module.exports = mongoose.model('Page', pageSchema);
