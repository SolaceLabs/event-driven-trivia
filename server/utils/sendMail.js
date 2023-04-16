require('dotenv').config();

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = (mail) => {
  console.log('Sending mail to ', mail.to);
  sgMail
    .send(mail)
    .then(() => {
      console.log('Mail successfully to', mail.to);
    }, error => {
      console.error('Mail send failed', error);
      if (error.response) {
        console.error('Mail send failed', error.response.body);
      }
    });
};

module.exports = {
  sendMail
};
