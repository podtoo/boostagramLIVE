// pages/api/fetchPodcast.ts

import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";
import { JSDOM } from "jsdom";
import { createDatabase } from "@/lib/factory";

interface PodcastData {
  title: string;
  image: string;
  summary: string;
  guid: string;
}

const parser = new Parser();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { rssUrl } = req.body;

  if (!rssUrl) {
    return res.status(400).json({ error: "RSS URL is required" });
  }

  try {
    const feed = await parser.parseURL(rssUrl);

    // Fetch the raw RSS XML to manually extract the itunes:image
    const response = await fetch(rssUrl);
    const rawXml = await response.text();
    const dom = new JSDOM(rawXml);
    const itunesImageElement = dom.window.document.querySelector("itunes\\:image");
    // Extract <podcast:guid> value
    const podcastGuidElement = dom.window.document.querySelector("podcast\\:guid");
    const guid = podcastGuidElement?.textContent?.trim() || "";
 

    const podcast: PodcastData = {
      title: feed.title || "Untitled Podcast",
      image: itunesImageElement?.getAttribute("href") || "",
      summary: feed.itunes?.summary || feed.description || "No summary available",
      guid: guid || "",
    };

      // Create database instance
      const db = createDatabase();
      await db.connect();
        // Save settings to the database
        const podData = {
            title:podcast.title,
            image:podcast.image,
            summary:podcast.summary,
            guid:podcast.guid,
            url:rssUrl,
        };
    
     await db.insert("podcasts", podData);
  

    res.status(200).json(podcast);
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error);
    res.status(500).json({ error: "Failed to fetch podcast data" });
  }
}
