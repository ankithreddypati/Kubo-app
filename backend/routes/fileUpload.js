import express from 'express';
import multer from 'multer';
import KnowledgeBase from '../models/KnowledgeBase.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, companyId } = req.body;
    const { path, mimetype } = req.file;

    const newKnowledgeBase = new KnowledgeBase({
      title,
      content: 'Placeholder for extracted text', // You'll need to implement text extraction
      fileType: mimetype.includes('pdf') ? 'pdf' : 'text',
      fileLocation: path,
      company: companyId,
    });

    await newKnowledgeBase.save();

    res.status(201).json({ message: 'File uploaded successfully', id: newKnowledgeBase._id });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

export default router;