import type { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

// Helper function to get the ID field regardless of naming
const getId = (doc: any): string => doc._id?.$oid || doc._id || doc.id || "";

// Helper function to format Unix timestamp to GMT date string
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toUTCString();
};

// Helper function to convert a JSON object to XML
const jsonToXml = (obj: any): string => {
  let xml = "";
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach((item: any) => {
          xml += `<${key}>${jsonToXml(item)}</${key}>`;
        });
      } else if (typeof value === "object") {
        xml += `<${key}>${jsonToXml(value)}</${key}>`;
      } else {
        xml += `<${key}>${value}</${key}>`;
      }
    }
  }
  
  return xml;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug, type } = req.query;  // Get the 'type' query parameter
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
    }

    let queryConditions: Array<[string, string, any]> = [["status", "==", "settled"]];

    // Build query conditions based on what we identified
    if (walletname && podcastGUID && episodeGUID) {
      queryConditions.push(["walletName", "==", walletname]);
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (walletname && episodeGUID) {
      queryConditions.push(["walletName", "==", walletname]);
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (walletname && podcastGUID) {
      const podcastResults = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
      if (podcastResults.length > 0) {
        const podcastId = getId(podcastResults[0]);
        const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
        const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);
        queryConditions.push(["walletName", "==", walletname]);
        queryConditions.push(["episodeGUID", "in", episodeGUIDs]);
      } else {
        queryConditions.push(["walletName", "==", walletname]);
      }
    } else if (podcastGUID && episodeGUID) {
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (episodeGUID) {
      queryConditions.push(["episodeGUID", "==", episodeGUID]);
    } else if (podcastGUID) {
      const podcastResults = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
      if (podcastResults.length > 0) {
        const podcastId = getId(podcastResults[0]);
        const episodeResults = await db.get("episodes", [["podcastId", "==", podcastId]], []);
        const episodeGUIDs = episodeResults.map((ep: any) => ep.guid);
        queryConditions.push(["episodeGUID", "in", episodeGUIDs]);
      }
    } else if (walletname) {
      queryConditions.push(["walletName", "==", walletname]);
    }

    // Fetch the boosts based on the query conditions
    let boosts = await db.get("boosts", queryConditions, []);

    if (!boosts || boosts.length === 0) {
      return res.status(200).json({ comments: [] });
    }

    // Fetch the podcast and episode details
    const podcast = await db.get("podcasts", [["guid", "==", podcastGUID]], []);
    const episode = await db.get("episodes", [["guid", "==", episodeGUID]], []);

    if (!podcast || !episode) {
      return res.status(404).json({ error: "Podcast or episode not found." });
    }

    const channel = {
      title: `${episode[0].title}`,
      link: episode[0].link,
      pubDate: formatDate(new Date(episode[0].pubDate).getTime() / 1000),
      lastBuildDate: formatDate(Date.now() / 1000),
      items: boosts.map((boost: any) => ({
        author: boost.username || "Anonymous",
        link: boost.userProfileLink || null,
        image: boost.userProfileImage || null,
        description: boost.comment || null,
        source: boost.appName || null,
        pubDate: formatDate(boost.settled_at ? boost.settled_at * 1000 : Date.now()),
      })),
    };

    // Check the 'type' query parameter and return the correct response type
    if (type === "xml") {
      // Generate and return XML if requested
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss><channel>${jsonToXml(channel)}</channel></rss>`;
      res.setHeader("Content-Type", "application/xml");
      return res.status(200).send(xml);
    } else {
      // Default to JSON
      return res.status(200).json(channel);
    }
  } catch (error: any) {
    console.error("Error fetching boosts:", error.message || error);
    res.status(500).json({ error: "Internal server error." });
  }
}
