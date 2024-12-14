// pages/api/checkEpisodes.ts

import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";
import { createDatabase } from "@/lib/factory";
import { JSDOM } from "jsdom";

interface EpisodeData {
  title: string;
  link: string;
  description: string;
  guid: string;
  image: string;
  duration: string;
  pubDate: string;
}

const parser = new Parser();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Create database instance
  const db = createDatabase();
  await db.connect();

  try {
    // Fetch all podcasts from the database
    const podcasts = await db.get("podcasts", []);

    for (const podcast of podcasts) {
      try {
        console.log(`Checking episodes for podcast: ${podcast.title}`);
        
        const feed = await parser.parseURL(podcast.url);
        const rawXmlResponse = await fetch(podcast.url);
        const rawXml = await rawXmlResponse.text();
        const dom = new JSDOM(rawXml);

        // Loop through each item in the RSS feed
        for (const item of feed.items) {
          // Extract details from each item
          const title = item.title || "Untitled Episode";
          const link = item.link || "";
          const description = item.contentSnippet || "";
          const pubDate = item.pubDate || "";

          // Extract <guid> with different formats
          const guidElement = dom.window.document.querySelector(`item guid`);
          const guid = guidElement?.textContent?.trim() || item.guid || "";

          // Extract <itunes:image> if available
          const itunesImageElement = dom.window.document.querySelector(`item itunes\\:image`);
          const image = itunesImageElement?.getAttribute("href") || "";

          // Extract <itunes:duration> if available
          const durationElement = dom.window.document.querySelector(`item itunes\\:duration`);
          const duration = durationElement?.textContent?.trim() || "";

          // Create episode object
          const episode: EpisodeData = {
            title,
            link,
            description,
            guid,
            image,
            duration,
            pubDate,
          };

          console.log("Found episode:", episode);

          // Store the episode data in the database if it doesn't already exist
          const existingEpisode = await db.get("episodes", [["guid", "==", `${guid}`]]);
          if (!existingEpisode[0]) {
            await db.insert("episodes", { ...episode, podcastId: podcast._id });
            console.log(`Inserted new episode: ${title}`);
          } else {
            console.log(`Episode already exists: ${title}`);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch episodes for podcast: ${podcast.title}`, error);
      }
    }

    res.status(200).json({ message: "Episodes checked and updated successfully" });
  } catch (error) {
    console.error("Error fetching podcasts from the database:", error);
    res.status(500).json({ error: "Failed to check episodes" });
  } finally {
    await db.close();
  }
}
