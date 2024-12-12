import { createDatabase } from "@/lib/factory";
import { decrypt } from "@/lib/encryption";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

const TOKEN_EXPIRY_DAYS = 7;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    username,
    password
  } = req.body;


  if(!username){
    return res.status(400).json({ error: "No user found" });
  }   
  if(!password){
    return res.status(400).json({ error: "No user found" });
  }


  // Create database instance
  const db = createDatabase();
  await db.connect();

  try {
    
    const userlogin = await db.get("settings", [["adminUsername", "==", `${username}`]], []);
    
    if (userlogin.length === 0) {
      return res.status(404).json({ error: "Not found in settings found" });
    }


    const storedHashedPassword = userlogin[0].adminPassword;

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, storedHashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Get the current timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Generate a UUID token for the session
    const sessionToken = uuidv4();

    // Set the expiry date for the token
    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + TOKEN_EXPIRY_DAYS);

    // Store the session token in the userAccess collection
    await db.insert("userAccess", {
      username,
      token: sessionToken,
      expireTime,
      createdAt: new Date(),
    });

    // Set the cookie with the session token
    res.setHeader(
      "Set-Cookie",
      `boostagram_user=${sessionToken}; Path=/; Max-Age=${TOKEN_EXPIRY_DAYS * 24 * 60 * 60}; SameSite=Strict;`
    );

  
   

    return res.status(200).redirect("/admin");
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Ensure the database connection is closed
    await db.close();
  }
}
