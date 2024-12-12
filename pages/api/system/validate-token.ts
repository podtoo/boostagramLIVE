import { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: "No token provided" });
  }

  try {
    const db = createDatabase();
    await db.connect();

    const currentUnixTime = Math.floor(Date.now() / 1000);

    // Check if the token exists and is not expired
    const user = await db.get("userAccess", [
      ["token", "==", token],
      ["expireTime", ">=", currentUnixTime],
    ]);

    if (user) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.error("Error validating token:", error);
    return res.status(500).json({ valid: false, message: "Internal server error" });
  }
}
