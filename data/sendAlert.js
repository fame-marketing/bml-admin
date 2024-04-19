const email = require('nodemailer'),
      winston = require('winston')
;

async function sendAlert(recipient) {

  let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/sbin/sendmail'
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fame Dev" <dev@youneedfame.com>', // sender address
    to: "josh@fame.marketing", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  logger.info('Alert has been sent: %j', info.messageerror)

}

sendAlert().catch( () => {
  logger.error('Could not send the alert.')
})

module.exports = sendAlert;