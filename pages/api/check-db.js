import { createDatabase } from "../../lib/factory";

export default async function handler(req, res) {
  const db = createDatabase();

  try {
    await db.connect();
    const settings = await db.get("settings", []);
    res.status(200).json({ dbConnected: settings.length > 0 });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ dbConnected: false });
  } finally {
    //await db.close();
  }
}
