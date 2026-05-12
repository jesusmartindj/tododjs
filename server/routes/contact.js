import express from 'express';
import multer from 'multer';
import { sendEmail } from  '../services/emailService.js';
const router = express.Router();



router.post('/', async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;

  const text = `New contact form submission:

Name: ${name}
Email: ${email}
Phone Number: ${phoneNumber}

Message:
${message}
  `;

  await sendEmail({
    to: ['contacto.tododjs@gmail.com','support@tododjs.com'],
    subject: 'Contact Form Submission from [' + name + '] / [' + email + ']',
    text
  });
  return res.status(200).json({ message: 'Contact form submitted successfully!' });
});


export default router;
