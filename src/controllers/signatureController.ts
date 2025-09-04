import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
interface VerifySignatureRequest {
  message: string;
  signature: string;
}

interface VerifySignatureResponse {
  isValid: boolean;
  signer: string;
  originalMessage: string;
  messageHash: string;
}

interface AppError extends Error {
  status?: number;
}

export const verifySignature = async (
  req: Request<{}, VerifySignatureResponse, VerifySignatureRequest>,
  res: Response<VerifySignatureResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, signature } = req.body;

    if (!message || !signature) {
      const error: AppError = new Error('Missing message or signature');
      error.status = 400;
      throw error;
    }

    if (typeof message !== 'string' || typeof signature !== 'string') {
      const error: AppError = new Error('Message and signature must be strings');
      error.status = 400;
      throw error;
    }

    let recoveredAddress: string;
    let messageHash: string;

    try {
      recoveredAddress = ethers.verifyMessage(message, signature);
      
      messageHash = ethers.hashMessage(message);
      
      const recoveredSigner = ethers.recoverAddress(messageHash, signature);
      
      const isValid = recoveredAddress.toLowerCase() === recoveredSigner.toLowerCase();
      
      res.json({
        isValid,
        signer: recoveredAddress,
        originalMessage: message,
        messageHash,
      });
    } catch (ethersError) {
      const error: AppError = new Error('Invalid signature format or unable to recover address');
      error.status = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};