import express from 'express'
import cors from 'cors'
import { ethers } from 'ethers'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/verify-signature', (req, res) => {
  const { message, signature } = req.body
  if (!message || !signature) {
    return res.status(400).json({ error: 'Missing message or signature' })
  }
  try {
    const signer = ethers.verifyMessage(message, signature)
    // Optionally, you can check if the signature is valid by comparing with an expected address
    res.json({
      isValid: !!signer,
      signer,
      originalMessage: message,
    })
  } catch (err) {
    res.json({
      isValid: false,
      signer: null,
      originalMessage: message,
      error: err.message,
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Verifier backend running on port ${PORT}`)
})