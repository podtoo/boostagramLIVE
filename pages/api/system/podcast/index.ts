import { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }


  try {
   
      // Create database instance
      const db = createDatabase();
      await db.connect();
    
    const podcasts = await db.get("podcasts", []);
    const podcastArray = Array.isArray(podcasts) ? podcasts : [podcasts];


    res.status(200).json(podcastArray);
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    res.status(500).json({ error: "Failed to fetch podcast data" });
  }
}
