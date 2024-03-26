require('dotenv').config()
var nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
  });
  