import dbInstance from "../factory";

(async () => {
  try {
    await dbInstance.connect();
    console.log("Database connection initialized.");
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
  }
})();