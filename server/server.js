const app = require("./src/app");
const { pool } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

// Test database connection before listening for requests
pool
  .connect()
  .then((client) => {
    client.release();
    console.log("✅ Database pool connected and ready.");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Closing HTTP server and database pool...`);
      server.close(async () => {
        try {
          await pool.end();
          console.log("🔌 Database pool closed. Server terminated cleanly.");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during shutdown:", err.message);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to PostgreSQL database on startup:", err.message);
    process.exit(1);
  });
