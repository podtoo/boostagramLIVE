// pages/api/system/walletmanagment/updatesubwallet.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, podcastGuid, domain } = req.body;

  if (!name || !podcastGuid || !domain) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = createDatabase();
    await db.connect();

    // Check if the subwallet already exists using the get method with query conditions
    const existingSubwallets = await db.get("walletmanagement", [["name", "==", name]]);

    if (existingSubwallets.length > 0) {
      // If a matching subwallet exists, update it
      await db.update("walletmanagement", { name }, { podcastGuid });
      res.status(200).json({ message: "Subwallet updated successfully" });
    } else {
      // If no matching subwallet exists, insert a new one
      await db.insert("walletmanagement", { name, podcastGuid });
      res.status(201).json({ message: "Subwallet created successfully" });
    }
  } catch (error) {
    console.error("Error updating or inserting subwallet:", error);
    res.status(500).json({ error: "Failed to update or insert subwallet" });
  } finally {
  }
}
