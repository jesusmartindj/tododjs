import express from 'express';
import multer from 'multer';
import { sendEmail } from  '../services/emailService.js';
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

router.post('/', upload.single("attachment_0"), async (req, res) => {
  console.log('Received contact form submission:', req.body);
  const { name, email, phoneNumber, subject, message } = req.body;

  const text = `New contact form submission:

Name: ${name}
Email: ${email}
Phone Number: ${phoneNumber}
Subject: ${subject}
Message:
${message}
  `;

  const attachments = [];
  if (req.file) {
    attachments.push({
      filename: req.file.originalname,
      content: req.file.buffer
    });
  }

  await sendEmail({
    to: ['contacto.tododjs@gmail.com','support@tododjs.com'],
    subject: 'Contact Form Submission from [' + name + '] / [' + email + ']',
    text,
    attachements: attachments
  });
  return res.status(200).json({ message: 'Contact form submitted successfully!' });
});


export default router;
