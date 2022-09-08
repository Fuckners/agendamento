const mongoose = require('mongoose');

const apointment = new mongoose.Schema({
    name: String,
    email: String,
    desc: String,
    cpf: String,
    date: Date,
    finished: { type: Boolean, default: false },
    notified: { type: Boolean, default: false }
});

module.exports = apointment;
