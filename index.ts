import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { verifySignature } from './src/controllers/signatureController.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/verify-signature', verifySignature);

app.use(errorHandler);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    error: { 
      message: 'Not Found', 
      status: 404 
    } 
  });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, () => {
  console.log(`Verifier backend running on port ${PORT}`);
});

export default app;