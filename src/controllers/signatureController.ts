import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

// Define interfaces for better type safety
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

    // Validate input
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

    // Verify the signature using ethers
    let recoveredAddress: string;
    let messageHash: string;

    try {
      // Recover the address from the signature
      recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Get the message hash
      messageHash = ethers.hashMessage(message);
      
      // Double-check by recovering address from hash and signature
      const recoveredSigner = ethers.recoverAddress(messageHash, signature);
      
      // Ensure both methods return the same address
      const isValid = recoveredAddress.toLowerCase() === recoveredSigner.toLowerCase();
      
      res.json({
        isValid,
        signer: recoveredAddress,
        originalMessage: message,
        messageHash,
      });
    } catch (ethersError) {
      // Handle ethers-specific errors
      const error: AppError = new Error('Invalid signature format or unable to recover address');
      error.status = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};