import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), "lib/boostagram/version.json");
    const versionData = JSON.parse(fs.readFileSync(filePath, "utf8"));

    res.status(200).json(versionData);
  } catch (error) {
    console.error("Error reading version.json:", error);
    res.status(500).json({ error: "Failed to load version information" });
  }
}
