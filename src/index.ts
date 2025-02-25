import dotenv from 'dotenv';
import express from 'express';
import { ENV } from './shared/ENV';
import { EndpointMCPServer } from './server/EndpointMCPServer';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { Express } from 'express';
import { ServerResponse, IncomingMessage } from 'http';

dotenv.config();

const APIFOX_USER_ACCESS_TOKEN = process.env.APIFOX_USER_ACCESS_TOKEN;
if (!APIFOX_USER_ACCESS_TOKEN) {
  console.log('APIFOX_USER_ACCESS_TOKEN environment variable is not set, please set it in .env');
  process.exit(1);
}

function createMcpServer(app: Express) {
  const mcpServer = new McpServer({
    name: `Apifox MCP Server`,
    version: '0.1.0',
  });

  const sseUrl = '/sse';
  const messagesUrl = '/messages';

  let sseTransport: SSEServerTransport | undefined = undefined;

  app.get(sseUrl, async (_req, res) => {
    console.log('New SSE connection established', sseUrl);
    sseTransport = new SSEServerTransport(messagesUrl, res as unknown as ServerResponse<IncomingMessage>);
    await mcpServer.connect(sseTransport);
  });

  app.post(messagesUrl, async (req, res) => {
    if (!sseTransport) {
      res.sendStatus(400);
      return;
    }

    await sseTransport.handlePostMessage(
      req as unknown as IncomingMessage,
      res as unknown as ServerResponse<IncomingMessage>,
    );
  });

  const baseUrl = `http://localhost:${ENV.PORT}`;
  console.log(`SSE endpoint: ${baseUrl}${sseUrl}`);
  console.log(`Message endpoint: ${baseUrl}${messagesUrl}`);

  return mcpServer;
}

async function main() {
  const app = express();
  const mcpServer = createMcpServer(app);

  [new EndpointMCPServer(mcpServer)].map((server) => {
    return server.registerTools();
  });

  app.listen(ENV.PORT, () => {
    console.log(`HTTP server listening on port ${ENV.PORT}`);
  });
}

main().catch((error) => {
  console.log('失败', error);
});
