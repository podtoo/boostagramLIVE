// pages/api/system/walletmanagment/updatesubwallet.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  

  try {
    const db = createDatabase();
    await db.connect();

    // Check if the subwallet already exists using the get method with query conditions
    const existingSubwallets = await db.get("walletmanagement",[]);
    const subwalletArray = Array.isArray(existingSubwallets) ? existingSubwallets : [existingSubwallets];

    res.status(200).json(subwalletArray);
  } catch (error) {
    console.error("Error updating or inserting subwallet:", error);
    res.status(500).json({ error: "Failed to update or insert subwallet" });
  } finally {
  }
}
