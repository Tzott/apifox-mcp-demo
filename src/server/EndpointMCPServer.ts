import { z } from 'zod';
import { apifoxRequest } from '../shared/apifoxRequest.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export class EndpointMCPServer {
  protected mcpServer: McpServer;

  public constructor(mcpServer: McpServer) {
    this.mcpServer = mcpServer;
  }

  public registerTools() {
    this.mcpServer.tool(
      'get_endpoint_oas_by_link',
      '通过 Apifox 的协作链接来获取此接口的 OpenAPI Specification 格式定义，协作链接格式如下：https://app.apifox.com/link/project/{projectId}/apis/api-{endpointId} ，{projectId} 为 Apifox 的项目 ID，{endpointId} 为接口（Endpoint）的 ID，由于该链接是无法直接访问的，所以需要通过本工具来获取。如发现有符合条件的链接，则调用本工具',
      {
        projectId: z.number().describe('Apifox 的项目 ID'),
        endpointId: z.number().describe('接口（Endpoint）的 ID'),
      },
      async ({ projectId, endpointId }) => {
        const url = `/v1/projects/${projectId}/export-openapi`;
        try {
          console.log('Fetching openapi url', projectId, endpointId);
          const file = await apifoxRequest(url, {
            projectId,
            method: 'POST',
            body: JSON.stringify({
              projectId,
              type: 2,
              format: 'json',
              version: '3.0',
              apiDetailId: [Number(endpointId)],
              includeTags: [],
              excludeTags: [],
              checkedFolder: [],
              selectedEnvironments: [],
              excludeExtension: true,
              excludeTagsWithFolder: true,
            }),
          });
          console.log(`Successfully fetched apifox openapi url: ${url}`);
          return {
            content: [{ type: 'text', text: JSON.stringify(file, null, 2) }],
          };
        } catch (error) {
          console.error(`Error fetching url ${url}:`, error);
          return {
            content: [{ type: 'text', text: `Error fetching file: ${error}` }],
          };
        }
      },
    );
  }
}
