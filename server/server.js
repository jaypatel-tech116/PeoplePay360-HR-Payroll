const app = require("./src/app");
const { pool } = require("./src/config/mysqlDb");

const PORT = process.env.PORT || 5000;

// Test MySQL database connection before listening for requests
async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database pool connected and ready (peoplepay360).");
    connection.release();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 PeoplePay360 Server running on http://localhost:${PORT}`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Closing HTTP server and MySQL pool...`);
      server.close(async () => {
        try {
          await pool.end();
          console.log("🔌 MySQL pool closed. Server terminated cleanly.");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during shutdown:", err.message);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("❌ Failed to connect to MySQL database on startup:", err.message);
    process.exit(1);
  }
}

startServer();
