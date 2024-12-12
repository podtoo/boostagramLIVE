import { createDatabase } from "../../lib/factory";
import { encrypt } from "../../lib/encryption";
import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 10;

// Function to generate a new encryption key
const generateEncryptionKey = () => crypto.randomBytes(32).toString("hex");

// Function to validate if an encryption key is in the correct format
const isValidEncryptionKey = (key) => /^[a-f0-9]{64}$/.test(key);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { podcastName, nostrConnectAddress, adminUsername, adminPassword } = req.body;

  if (!podcastName || !nostrConnectAddress || !adminUsername || !adminPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Ensure process.env.ENCRYPTION_KEY is set and valid
    let encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey || !isValidEncryptionKey(encryptionKey)) {
      encryptionKey = generateEncryptionKey();
    }

    // Encrypt the Nostr Connect address using the valid encryption key
    const encryptedNostrAddress = encrypt(nostrConnectAddress, encryptionKey);

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    // Create database instance
    const db = createDatabase();
    await db.connect();

    // Save settings to the database
    const data = {
      podcastName,
      nostrConnectAddress: encryptedNostrAddress,
      adminUsername,
      adminPassword: hashedPassword,
      createdAt: new Date(),
    };

    const result = await db.insert("settings", data);
    await db.close();

    // Respond with success message and the encryption key (if newly generated)
    res.status(200).json({
      message: "Settings saved successfully",
      result,
      encryptionKey: !process.env.ENCRYPTION_KEY ? encryptionKey : null,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
}
