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

    let queryConditions: Array<[string, string, any]> = [["status", "==", "settled"]];
    let walletname: string | undefined;
    let podcastGUID: string | undefined;
    let episodeGUID: string | undefined;

    if (!slug || !Array.isArray(slug) || slug.length === 0) {
      return res.status(400).json({ error: "Invalid request. Please provide valid parameters." });
    }

    // Handle cases with one parameter
    if (slug.length === 1) {
      const param = slug[0] as string;

      // Check if the param matches an episode GUID
      const episodeResults = await db.get("episodes", [["guid", "==", param]], []);
      if (episodeResults.length > 0) {
        episodeGUID = param;
      } else {
        // Check if the param matches a podcast GUID
        const podcastResults = await db.get("podcasts", [["guid", "==", param]], []);
        if (podcastResults.length > 0) {
          podcastGUID = param;
        } else {
          // Fallback to treating the parameter as a walletname
          walletname = param;
        }
      }
    }

    // Handle cases with two parameters
    if (slug.length === 2) {
      [walletname, podcastGUID] = slug as string[];
    }

    // Handle cases with three parameters
    if (slug.length === 3) {
      [walletname, podcastGUID, episodeGUID] = slug as string[];
    }

    // Case 1: walletname + podcastGUID + episodeGUID
    if (walletname && podcastGUID && episodeGUID) {
      const walletExists = await db.get("boosts", [["walletName", "==", walletname]], []);
      const episodeExists = await db.get("episodes", [["guid", "==", episodeGUID]], []);
      if (walletExists.length > 0 && episodeExists.length > 0) {
        queryConditions.push(["walletName", "==", walletname]);
        queryConditions.push(["episiodeGUID", "==", episodeGUID]);
      }
    }
    // Case 2: walletname + podcastGUID
    else if (walletname && podcastGUID) {
      const walletExists = await db.get("boosts", [["walletName", "==", walletname]], []);
      const podcastResults = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
      if (walletExists.length > 0 && podcastResults.length > 0) {
        const podcastId = getId(podcastResults[0]);
        const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
        const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);
        queryConditions.push(["walletName", "==", walletname]);
        queryConditions.push(["episiodeGUID", "in", episodeGUIDs]);
      }
    }
    // Case 3: walletname + episodeGUID
    else if (walletname && episodeGUID) {
      const walletExists = await db.get("boosts", [["walletName", "==", walletname]], []);
      const episodeExists = await db.get("episodes", [["guid", "==", episodeGUID]], []);
      if (walletExists.length > 0 && episodeExists.length > 0) {
        queryConditions.push(["walletName", "==", walletname]);
        queryConditions.push(["episiodeGUID", "==", episodeGUID]);
      }
    }
    // Case 4: podcastGUID + episodeGUID
    else if (podcastGUID && episodeGUID) {
      const episodeExists = await db.get("episodes", [["guid", "==", episodeGUID]], []);
      if (episodeExists.length > 0) {
        queryConditions.push(["episiodeGUID", "==", episodeGUID]);
      }
    }
    // Case 5: walletname only
    else if (walletname) {
      const walletExists = await db.get("boosts", [["walletName", "==", walletname]], []);
      if (walletExists.length > 0) {
        queryConditions.push(["walletName", "==", walletname]);
      }
    }
    // Case 6: podcastGUID only
    else if (podcastGUID) {
      const podcastResults = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
      if (podcastResults.length > 0) {
        const podcastId = getId(podcastResults[0]);
        const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
        const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);
        queryConditions.push(["episiodeGUID", "in", episodeGUIDs]);
      }
    }
    // Case 7: episodeGUID only
    else if (episodeGUID) {
      const episodeExists = await db.get("episodes", [["guid", "==", episodeGUID]], []);
      if (episodeExists.length > 0) {
        queryConditions.push(["episiodeGUID", "==", episodeGUID]);
      }
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
      datePosted: boost.settled_at ? formatDate(boost.settled_at) : "",
    }));

    res.status(200).json({ comments });
  } catch (error: any) {
    console.error("Error fetching boosts:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  }
}
