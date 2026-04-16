const app = require("./app");
const env = require("./config/env");
const prisma = require("./db/prisma");

const server = app.listen(env.port, () => {
  console.log(`${env.appName} backend listening on port ${env.port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
