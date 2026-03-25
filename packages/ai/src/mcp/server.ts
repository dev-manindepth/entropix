/**
 * Entropix MCP Server
 *
 * Start the Entropix MCP server using the stdio transport.
 *
 * Run via: npx entropix-ai mcp-server
 * Or add to MCP config:
 * {
 *   "mcpServers": {
 *     "entropix": {
 *       "command": "npx",
 *       "args": ["entropix-ai", "mcp-server"]
 *     }
 *   }
 * }
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

export async function startMCPServer(): Promise<void> {
  // Dynamic import so @modelcontextprotocol/sdk is optional
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ServerClass: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let StdioTransportClass: any;

  try {
    // Use variable to prevent TypeScript from resolving the module at build time
    const sdkServer = "@modelcontextprotocol/sdk/server/index.js";
    const sdkStdio = "@modelcontextprotocol/sdk/server/stdio.js";
    const serverModule = await import(sdkServer);
    ServerClass = serverModule.Server;

    const stdioModule = await import(sdkStdio);
    StdioTransportClass = stdioModule.StdioServerTransport;
  } catch {
    console.error(
      "Error: @modelcontextprotocol/sdk is required for the MCP server.\n" +
        "Install it with: npm install @modelcontextprotocol/sdk\n",
    );
    process.exit(1);
  }

  const server = new ServerClass(
    {
      name: "entropix",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register tool listing
  server.setRequestHandler(
    { method: "tools/list" },
    async () => ({
      tools: ENTROPIX_MCP_TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }),
  );

  // Register tool call handler
  server.setRequestHandler(
    { method: "tools/call" },
    async (request: {
      params: { name: string; arguments?: Record<string, unknown> };
    }) => {
      const { name, arguments: args = {} } = request.params;

      let result: ToolResult;

      switch (name) {
        case "entropix_list_components":
          result = handleListComponents(args as ListComponentsInput);
          break;

        case "entropix_component_info":
          result = handleComponentInfo(args as unknown as ComponentInfoInput);
          break;

        case "entropix_render_ui":
          result = handleRenderUI(args as unknown as RenderUIInput);
          break;

        case "entropix_generate_ui":
          result = await handleGenerateUI(args as unknown as GenerateUIInput);
          break;

        default:
          result = {
            content: [
              {
                type: "text",
                text: `Unknown tool: "${name}". Available tools: ${ENTROPIX_MCP_TOOLS.map((t) => t.name).join(", ")}`,
              },
            ],
            isError: true,
          };
      }

      return result;
    },
  );

  // Connect via stdio
  const transport = new StdioTransportClass();
  await server.connect(transport);

  console.error("Entropix MCP server running on stdio");
}
