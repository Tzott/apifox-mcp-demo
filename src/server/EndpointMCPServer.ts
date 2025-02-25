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
      'get_endpoint_openapi_definition_by_project_cooperation_link',
      '通过 Apifox 的协作链接，格如：https://app.apifox.com/link/project/:projectId/apis/:resourceType-:resourceId，来获取此接口的 OpenAPI 定义',
      {
        projectId: z.number().describe('Apifox 的项目 ID'),
        resourceType: z.literal('api').describe('资源类型。目前只支持 api'),
        resourceId: z.number().describe('资源 ID'),
      },
      async ({ projectId, resourceType, resourceId }) => {
        const url = `/v1/projects/${projectId}/export-openapi`;
        try {
          console.log('Fetching openapi url', projectId, resourceType, resourceId);
          const file = await apifoxRequest(url, {
            projectId,
            method: 'POST',
            body: JSON.stringify({
              projectId,
              type: 2,
              format: 'json',
              version: '3.0',
              apiDetailId: [Number(resourceId)],
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
