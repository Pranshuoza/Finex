const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    }
  });
  
  const sendEmail = async (to, subject, html) => {
    try {
      await transporter.sendMail({ from: 'Finex <pixelbazaar26@gmail.com>', to, subject, html });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  module.exports = { sendEmail };