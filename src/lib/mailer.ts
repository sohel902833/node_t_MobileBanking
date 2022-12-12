import {createTransport,createTestAccount,getTestMessageUrl} from 'nodemailer'

interface IEmail{
  to:string;
  subject:string;
  html?:string;
}

export const sendMail=async({to,html,subject}:IEmail)=> {
  const userName=process.env.MAILER_USER_NAME;
  const password=process.env.MAILER_USER_PASSWORD;
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: userName, 
      pass: password, 
    },
  });
  const info = await transporter.sendMail({
    from: userName, 
    to: to,
    subject:subject, 
    html: html,
  });
}