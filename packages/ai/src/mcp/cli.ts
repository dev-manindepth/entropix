#!/usr/bin/env node
import { startMCPServer } from "./server.js";

const args = process.argv.slice(2);

if (args[0] === "mcp-server") {
  startMCPServer().catch((err: Error) => {
    console.error("Failed to start MCP server:", err.message);
    process.exit(1);
  });
} else {
  console.log("Usage: entropix-ai mcp-server");
  console.log("");
  console.log("Starts the Entropix MCP server for AI agent integration.");
  process.exit(0);
}
