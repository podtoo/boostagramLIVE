import type { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

// Helper function to get the ID field regardless of naming
const getId = (doc: any): string => doc._id?.$oid || doc._id || doc.id || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { title } = req.query;
  const db = createDatabase();

  try {
    // Connect to the database
    await db.connect();

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid request. Please provide a valid title." });
    }

    // Find the podcast by title
    const podcastResults = await db.get("podcasts", [["title", "==", title]], []);
    if (podcastResults.length === 0) {
      return res.status(404).json({ error: "Podcast not found." });
    }

    // Get the podcast ID
    const podcastId = getId(podcastResults[0]);

    // Find all episodes for this podcast
    const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
    if (episodeResults.length === 0) {
      return res.status(200).json({ count: 0 });
    }

    // Get all episode GUIDs
    const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);

    // Count comments (boosts) related to these episodes
    const boosts = await db.get("boosts", [["episodeGUID", "in", episodeGUIDs]], []);
    const commentCount = boosts.length;

    return res.status(200).json({ count: commentCount });
  } catch (error: any) {
    console.error("Error fetching comments:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  } finally {
  }
}
