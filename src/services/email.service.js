import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();



const host=process.env.EMAIL_HOST
const port=process.env.EMAIL_PORT
const User=process.env.EMAIL_USER
const password=process.env.EMAIL_PASS
const from=process.env.EMAIL_FROM
const URL=process.env.APP_URL

if(!host || !port || !User || !password || !from ||!URL)
{
 console.log("Configuration SMTP manquante"),
 process.exit(1)
}

// Création du transporteur
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",      
  port: Number(port),                   
  secure: true,                
  auth: {
    user: User,       
    pass: password,  
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Transporteur SMTP prêt !");
  }
});


//Creation de la fonction sendEmail

async function sendEmail(to, subject, html) {
    const mail = {
        from: from,   
        to: to,
        subject: subject,
        html: html
    }

    try {
        await transporter.sendMail(mail)
        console.log("Email envoyé avec succès à", to)
    } catch (error) {
        console.error("Erreur d'envoi de l'email :", error)
        throw new Error("Email service indisponible")
    }
}


