import { nwc } from "@getalby/sdk";
import { createDatabase } from "@/lib/factory";
import { decrypt } from "@/lib/encryption";

interface WalletInfo {
  totalBalance: number;
  //transactions: any[]; // Adjust type as needed
}

export async function getWalletBalance(username: string): Promise<WalletInfo> {
  if (!username) {
    throw new Error("No username provided");
  }

  // Connect to the database
  const db = createDatabase();
  await db.connect();

  // Fetch the wallet connection details
  const getWallet = await db.get("settings", [], ["nostrConnectAddress"]);
  const encryptedAddress = getWallet?.[0]?.nostrConnectAddress;
  if (!encryptedAddress) {
    throw new Error("Wallet connection not found in database");
  }

  // Decrypt the NWC URL
  const decryptWallet = await decrypt(encryptedAddress);
  if (!decryptWallet) {
    throw new Error("Failed to decrypt wallet address");
  }

  // Initialize the NWC client
  const client = new nwc.NWCClient({ nostrWalletConnectUrl: decryptWallet });

  console.log("NWCClient initialized. Fetching wallet info...");

  // Optionally fetch wallet service info (not strictly necessary for balance)
  await client.getWalletServiceInfo();

  // Fetch the balance
  const balance = await client.getBalance();
  const totalBalance = Math.floor(balance.balance / 1000) || 0;

  // Fetch transactions if needed
  const list_transactions = await client.listTransactions({});

  return {
    totalBalance
    //transactions: list_transactions || []
  };
}