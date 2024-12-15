import type { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

// Helper function to get the ID field regardless of naming
const getId = (doc: any): string => doc._id?.$oid || doc._id || doc.id || "";

// Helper function to format Unix timestamp to GMT date string
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toUTCString();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  const db = createDatabase();

  try {
    // Connect to the database
    await db.connect();

    if (!slug || !Array.isArray(slug)) {
      return res.status(400).json({ error: "Invalid request. Please provide valid parameters." });
    }

    let walletname: string | undefined;
    let podcastGUID: string | undefined;
    let episodeGUID: string | undefined;

    // Identify parameters by querying the database
    for (const param of slug) {
      // Check if param is an episodeGUID
      const episodeResults = await db.get("episodes", [["guid", "==", param]], []);
      if (episodeResults.length > 0) {
        episodeGUID = param;
        continue;
      }

      // Check if param is a podcastGUID
      const podcastResults = await db.get("podcasts", [["guid", "==", param]], []);
      if (podcastResults.length > 0) {
        podcastGUID = param;
        continue;
      }

      // Check if param is a walletname (exists in boosts)
      const walletExists = await db.get("boosts", [["walletName", "==", param]], []);
      if (walletExists.length > 0) {
        walletname = param;
        continue;
      }

      // If it doesn't match anything, we can either ignore or handle differently
      // For now, we ignore unknown parameters
    }

    let queryConditions: Array<[string, string, any]> = [["status", "==", "settled"]];

    // Build query conditions based on what we identified
    if (walletname && podcastGUID && episodeGUID) {
      // wallet + podcast + episode
      queryConditions.push(["walletName", "==", walletname]);
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (walletname && episodeGUID) {
      // wallet + episode
      queryConditions.push(["walletName", "==", walletname]);
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (walletname && podcastGUID) {
      // wallet + podcast
      const podcastResults = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
      if (podcastResults.length > 0) {
        const podcastId = getId(podcastResults[0]);
        const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
        const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);
        queryConditions.push(["walletName", "==", walletname]);
        queryConditions.push(["episodeGUID", "in", episodeGUIDs]);
      } else {
        // Just wallet if podcast not found
        queryConditions.push(["walletName", "==", walletname]);
      }
    } else if (podcastGUID && episodeGUID) {
      // podcast + episode
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (episodeGUID) {
      // only episode
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (podcastGUID) {
      // only podcast
      const podcastResults = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
      if (podcastResults.length > 0) {
        const podcastId = getId(podcastResults[0]);
        const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
        const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);
        queryConditions.push(["episodeGUID", "in", episodeGUIDs]);
      }
    } else if (walletname) {
      // only wallet
      queryConditions.push(["walletName", "==", walletname]);
    }

    // Fetch the boosts based on the query conditions
    let boosts = await db.get("boosts", queryConditions, []);

    if (!boosts || boosts.length === 0) {
      return res.status(200).json({ comments: [] });
    }

    // Transform boosts to the desired output format
    const comments = boosts.map((boost: any) => ({
      from: boost.username || "Anonymous",
      uri: boost.userProfileLink || null,
      avatar: boost.userProfileImage || null,
      appname: boost.appName || null,
      appicon: boost.appIcon || null,
      comment: boost.comment || null,
      episodeGUID: boost.episodeGUID || null, // Note the corrected spelling here
      datePosted: boost.settled_at ? formatDate(boost.settled_at) : "",
    }));

    res.status(200).json({ comments });
  } catch (error: any) {
    console.error("Error fetching boosts:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  }
}