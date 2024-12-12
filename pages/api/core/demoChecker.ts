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

  const {
    invoice
  } = req.query;


  if(!invoice){
    return res.status(400).json({ error: "No invoice" });
  }

  // Create database instance
  const db = createDatabase();
  await db.connect();

  try {
    // Fetch wallet connection settings
    const getWallet = await db.get("settings", [], ["nostrConnectAddress"]);
    const decryptWallet = await decrypt(getWallet[0]["nostrConnectAddress"]);
    console.log("Decrypted Wallet:", decryptWallet);

    if (!decryptWallet) {
      return res.status(404).json({ error: "Wallet connection not found" });
    }

    // Initialize the NWC client with the connectionSecret
    const nwcClient = new nwc.NWCClient({ nostrWalletConnectUrl: decryptWallet });

    // Fetch pending boosts
    const getPendingBoosts = await db.get("boosts", [["invoice", "==", `${invoice}`]], []);
    
    if (getPendingBoosts.length === 0) {
      return res.status(404).json({ error: "No pending boosts found" });
    }

    // Get the current timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Loop through each pending boost and check the transaction
    for (const boost of getPendingBoosts) {
      try {

        const transaction = await nwcClient.lookupInvoice({
          payment_hash: boost.payment_hash,
          invoice: boost.invoice
        });



        console.log(`Transaction result for boost ID ${boost._id}:`, transaction);

        // Check if both preimage and settled_at are not null
        if (transaction.preimage && transaction.settled_at) {
            const updateData = {
              preimage: transaction.preimage,
              fees: transaction.fees_paid,
              settled_at: transaction.settled_at,
              status: "settled", // Optionally update the status to "settled"
            };
  
            // Update the document in the database
            await db.update("boosts", boost._id, updateData);
            
            console.log(`Updated boost ID ${boost._id} with settlement data.`);
            return res.status(200).json({ success: true, boostagramId:boost._id });
          } else if (transaction.expires_at && transaction.expires_at < currentTime) {
            // Mark the document as expired if the current time is past the expiry
            const updateData = {
              status: "expired",
            };
  
            await db.remove("boosts", boost._id);
            console.log(`Removed boost ID ${boost._id} as expired.`);
            return res.status(200).json({ error: true, message:"invoice expired" });
          }
          else {
            console.log(`Updated boost ID ${boost._id} with settlement data.`);
            return res.status(200).json({ success: false, pending:true });
           }
      } catch (error) {
        console.error(`Error looking up invoice for boost ID ${boost._id}:`, error);
      }
    }

    return res.status(200).json({ message: "Transaction lookup completed for all pending boosts." });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the database connection is closed
    await db.close();
  }
}
