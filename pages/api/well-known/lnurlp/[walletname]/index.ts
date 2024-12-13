import type { NextApiRequest, NextApiResponse } from "next";
//import { getDomain, getBaseUrl } from "@/util/getalby"; // Adjust path if needed
import { nwc } from "@getalby/sdk";
import { createDatabase } from "@/lib/factory";
import { decrypt } from "@/lib/encryption";
//import { connectToDatabase } from "@/libraries/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { walletname } = req.query;

  if (!walletname || typeof walletname !== "string") {
    return res.status(400).json({ error: "No walletname provided" });
  }

  try {

    const protocol = req.headers["x-forwarded-proto"] || "http";
    const domain = req.headers.host//getDomain();
    const callbackUrl = `${protocol}://${req.headers.host}/.well-known/lnurlp/${walletname}/callback`;

 
        // Connect to DB
        const db = createDatabase();
        await db.connect();
       
        const getWallet = await db.get("settings",[],["nostrConnectAddress"]);
        const decryptWallet = await decrypt(getWallet[0]['nostrConnectAddress']);
       
        if (!decryptWallet) {
          return res.status(404).json({ error: "Wallet connection not found" });
        }

    
    
        

      // Initialize the NWC client with the connectionSecret
      const client = new nwc.NWCClient({ nostrWalletConnectUrl: decryptWallet });
      

      // Test connection by calling a lightweight method or emitting a log
      console.log("NWCClient initialized successfully. Attempting to fetch balance...");
  
      // connect to the relay
      const testWallet = await client.getWalletServiceInfo();
      const getWalletInfo = await client.getWalletServiceInfo();

      console.log(JSON.stringify(getWalletInfo));


      
      return res.status(200).json({
        status: "OK",
        tag: "payRequest",
        commentAllowed: 10000,
        callback: callbackUrl,
        minSendable: 1000,
        maxSendable: 10000000000,
        metadata: JSON.stringify([
          ["text/identifier", `${walletname}@${domain}`],
          ["text/plain", `Sats for user ${walletname}`]
        ]),
        payerData: {
            name: {
              mandatory: true
            },
            email: {
              mandatory: false
            },
            pubkey: {
              mandatory: false
            }
        },
        boostagram:{
          appName:"optional",
          appIcon:"optional",
          username:"optional",
          userProfileLink:"optional",
          userProfileImage:"optional",
          comment:"required",
          amount:"required",
          episodeGUID:"optional",
        }
      });
    } catch (error) {
      console.error("Error generating response:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
}
