/**
 * Entropix MCP Server
 *
 * Standalone MCP server exposing Entropix design system tools.
 * Uses stdio transport for Claude Desktop / Claude Code integration.
 */

import { ENTROPIX_MCP_TOOLS } from "./tools.js";
import type {
  ListComponentsInput,
  ComponentInfoInput,
  RenderUIInput,
  GenerateUIInput,
} from "./tools.js";
import {
  handleListComponents,
  handleComponentInfo,
  handleRenderUI,
  handleGenerateUI,
} from "./handlers.js";
import type { ToolResult } from "./handlers.js";

async function handleToolCall(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  switch (name) {
    case "entropix_list_components":
      return handleListComponents(args as ListComponentsInput);
    case "entropix_component_info":
      return handleComponentInfo(args as unknown as ComponentInfoInput);
    case "entropix_render_ui":
      return handleRenderUI(args as unknown as RenderUIInput);
    case "entropix_generate_ui":
      return await handleGenerateUI(args as unknown as GenerateUIInput);
    default:
      return {
        content: [{ type: "text" as const, text: `Unknown tool: "${name}"` }],
        isError: true,
      };
  }
}

export async function startMCPServer(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ServerClass: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let StdioTransport: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ListToolsRequestSchema: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let CallToolRequestSchema: any;

  try {
    const serverMod = await import(
      "@modelcontextprotocol/sdk/server/index.js"
    );
    ServerClass = serverMod.Server;
    const stdioMod = await import(
      "@modelcontextprotocol/sdk/server/stdio.js"
    );
    StdioTransport = stdioMod.StdioServerTransport;
    const typesMod = await import("@modelcontextprotocol/sdk/types.js");
    ListToolsRequestSchema = typesMod.ListToolsRequestSchema;
    CallToolRequestSchema = typesMod.CallToolRequestSchema;
  } catch {
    console.error(
      "Error: @modelcontextprotocol/sdk is required for the MCP server.\n" +
        "Install it with: npm install @modelcontextprotocol/sdk\n",
    );
    process.exit(1);
  }

  const server = new ServerClass(
    { name: "entropix", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ENTROPIX_MCP_TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  }));

  // Handle tool calls
  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: {
      params: { name: string; arguments?: Record<string, unknown> };
    }) => {
      const { name, arguments: args = {} } = request.params;
      return handleToolCall(name, args);
    },
  );

  // Connect via stdio
  const transport = new StdioTransport();
  await server.connect(transport);

  console.error("Entropix MCP server running on stdio");
}
