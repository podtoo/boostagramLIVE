import { createDatabase } from "@/lib/factory";
import { decrypt } from "@/lib/encryption";
import { NextApiRequest, NextApiResponse } from "next";
import { nwc } from "@getalby/sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Create database instance
  const db = createDatabase();
  await db.connect();

  const {
    walletname,
    amount,
    comment = "",
    appName = null,
    appIcon = null,
    username = null,
    userProfileLink = null,
    userProfileImage = null,
    episiodeGUID = null,
  } = req.query;

  // Convert amount to number and handle validation
  const parsedAmount = amount ? Number(amount) : null;

  if (!parsedAmount || isNaN(parsedAmount)) {
    return res.status(400).json({ error: "Invalid or missing amount" });
  }

  // Ensure `comment` is a string
  const description = Array.isArray(comment) ? comment[0] : comment;

  try {
    // CONNECT TO DB CODE HERE
    const getWallet = await db.get("settings", [], ["nostrConnectAddress"]);
    const decryptWallet = await decrypt(getWallet[0]["nostrConnectAddress"]);
    
    if (!decryptWallet) {
      return res.status(404).json({ error: "Wallet connection not found" });
    }

    // Initialize the NWC client with the connectionSecret
    const nwcClient = new nwc.NWCClient({ nostrWalletConnectUrl: decryptWallet });

    const commentQuery = {
      appName: appName || null,
      appIcon: appIcon || null,
      username: username || null,
      userProfileLink: userProfileLink || null,
      userProfileImage: userProfileImage || null,
      amount: parsedAmount,
      comment: description || null,
      episiodeGUID: episiodeGUID || null,
      type: "lightning",
      walletName:walletname
    };

    const createComment = await db.insert("boosts", commentQuery);

    const metadataKey = {
      appName: appName || null,
      appIcon: appIcon || null,
      username: username || null,
      userProfileLink: userProfileLink || null,
      boostagramID: createComment.insertedId,
      walletName:walletname
    };

    // Create a new invoice
    const transaction = await nwcClient.makeInvoice({
      amount: parsedAmount,
      description: `boostagram_id:${createComment.insertedId}`,
      expiry: 300,
      metadata:metadataKey
    });

    const transactionData = {
      invoice: transaction.invoice,
      fees_paid: transaction.fees_paid,
      purchase_hash: transaction.payment_hash,
      preimage: transaction.preimage,
      created_at: transaction.created_at,
      expires_at: transaction.expires_at,
      settled_at: transaction.settled_at,
      status: "pending",
    };

    const updated = await db.update("boosts", createComment.insertedId, transactionData);
    console.log("Update successful:", updated);

    return res.status(200).json({
      pr: transaction.invoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
