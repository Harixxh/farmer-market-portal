const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Subsidy', 'Loan', 'Insurance', 'Training', 'Support'],
    default: 'Subsidy'
  },
  ministry: {
    type: String,
    trim: true
  },
  eligibility: {
    type: String
  },
  deadline: {
    type: Date
  },
  link: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Upcoming', 'Closed'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scheme', SchemeSchema);
