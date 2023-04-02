// send password reset link to the user's email address
const nodemailer = require('nodemailer');

const mailPasswordResetLink = async (data) => {
  const {email, username, link, dateTime, linkExpiryTime} = data;
  // template
  const mailTemplate = (email, username, link, dateTime, linkExpiryTime) => {
    return `
    <!DOCTYPE html>
    <html>
      <body style="background-color: rgba(100,100,100,0.2); text-align: center; box-sizing: border-box; width: 75%; height: auto; margin: auto; padding: 10px">
        <h2> Password Reset </h2>
        <h4 style="margin: 0;"> 
          You made a request to reset your forgotten password. Please follow the link below to create a new password. The link is valid for ${linkExpiryTime} minutes. 
        </h4>
        <p> ${link} </p>
        <ul style="padding-left: 0; list-style-type: none;">
          <li> E-mail ${email} </li> 
          <li> Username ${username} </li> 
          <li> Created	${dateTime} </li> 
        </ul>
      </body>
    </html> `
  }
  // transport obj
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    }
  });
  // transport configuration
  const mailOptions = {
    from: 'noreply@noreply.com',
    to: email,
    subject: 'Password reset link - PhotoGallery',
    html: mailTemplate(email, username, link, dateTime, linkExpiryTime)
  };
  // send mail
  const send = await transporter.sendMail(mailOptions);
  transporter.close();
  if(!send) return res.status(502).json({success: false, message: "Couldn't send mail"});
}

module.exports = mailPasswordResetLink