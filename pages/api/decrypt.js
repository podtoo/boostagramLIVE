import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Ensure this is set in your .env file
const IV_LENGTH = 16; // AES block size

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { encryptedText } = req.body;

  if (!encryptedText) {
    return res.status(400).json({ error: "Missing encrypted text in request body." });
  }

  try {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    res.status(200).json({ decrypted: decrypted.toString() });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({ error: "Decryption failed." });
  }
}
