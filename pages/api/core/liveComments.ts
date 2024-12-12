import type { NextApiRequest, NextApiResponse } from "next";
import { createDatabase } from "@/lib/factory";

const boostTypes = {
  FIRST_TIME: "First Time Booster",
  BOOST_1000: "1000 sats Booster",
  BOOST_50X: "User Boosted 50x",
  BOOST_1M: "User Boosted 1M sats",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lastid } = req.query;

  // Create database instance
  const db = createDatabase();

  try {
    // Connect to the database
    await db.connect();

    let queryConditions: Array<[string, string, any]> = [["status", "==", "settled"]];

    if (lastid) {
      queryConditions.push(["id", ">", lastid]);
    } else {
      const currentUnixTime = Math.floor(Date.now() / 1000);
      const timeThreshold = currentUnixTime - 10000; // 5 minutes ago
      queryConditions.push(["settled_at", ">=", timeThreshold]);
    }

    // Fetch the boosts
    const boosts = await db.get("boosts", queryConditions, []);

    if (!boosts || boosts.length === 0) {
      res.status(200).json([]);
      return;
    }

    // Decorate each boost with the correct boostType
    const decoratedBoosts = await Promise.all(
      boosts.map(async (boost: any) => {
        const { username, appName } = boost;

        // Additional lookup to get all boosts by this username and appName
        const customCondition = [
          ["username", "==", username],
          ["appName", "==", appName],
        ];
        const userBoosts = await db.get("boosts", customCondition, []);

        // Calculate total amount and count for this user and app
        let userBoostedCount = 0;
        let userTotalAmount = 0;

        userBoosts.forEach((userBoost: any) => {
          userBoostedCount += 1;
          userTotalAmount += Math.floor(userBoost.amount / 1000); // Convert msats to sats
        });

        console.log(`Count: ${userBoostedCount}, Total Amount: ${userTotalAmount}`);

        // Determine the boostType based on the highest-priority condition
        let boostType = boostTypes.FIRST_TIME;

        if (userTotalAmount >= 1000000) {
          boostType = boostTypes.BOOST_1M;
        } else if (userTotalAmount >= 1000) {
          boostType = boostTypes.BOOST_1000;
        } else if (userBoostedCount >= 50) {
          boostType = boostTypes.BOOST_50X;
        }

        return {
          ...boost,
          amount: Math.floor(boost.amount / 1000),
          boostType,
        };
      })
    );

    res.status(200).json(decoratedBoosts);
  } catch (error: any) {
    console.error("Error fetching boosts:", error.message || error);
    res.status(400).json({ error: "Unauthorized or invalid request." });
  }
}
