const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['sent', 'received'], required: true },
  from: { type: String, required: true }, // wallet address
  to: { type: String, required: true },   // wallet address
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
