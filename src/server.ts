import app from "./app.js";
import config from "./config/index.js";
import { initDataBase } from "./db/index.js";

const main = async () => {
  try {
    // Initialize Database
    await initDataBase();

    // Start Server
    app.listen(config.port, () => {
      console.log(`Server is Running on PORT ${config.port}`);
    });
  } catch (error) {
    console.error("Server Startup Failed:", error);

    process.exit(1);
  }
};

main();
