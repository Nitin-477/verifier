import { ethers } from 'ethers';

export const verifySignature = async (req, res, next) => {
  try {
    const { message, signature } = req.body;
    if (!message || !signature) {
      const error = new Error('Missing message or signature');
      error.status = 400;
      throw error;
    }
    
    const recoveredAddress = ethers.verifyMessage(message, signature);

    const digest = ethers.hashMessage(message);
    const recoveredSigner = ethers.recoverAddress(digest, signature);

    const isValid =
      recoveredAddress?.toLowerCase() === recoveredSigner?.toLowerCase();

    res.json({
      isValid,
      signer: recoveredAddress,
      originalMessage: message,
      messageHash: digest
    });
  } catch (error) {
    next(error);
  }
};
