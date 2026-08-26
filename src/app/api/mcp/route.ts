import { NextResponse } from "next/server";
import { callTool, SERVER_INSTRUCTIONS, TOOLS } from "@/lib/mcp/tools";
import { SITE } from "@/lib/site";

/**
 * Model Context Protocol endpoint, streamable-HTTP transport.
 *
 * This speaks JSON-RPC directly rather than pulling in an adapter: the dataset
 * is read-only and stateless, so the whole protocol surface we need is
 * initialize / tools/list / tools/call / ping.
 */

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SERVER_VERSION = "1.0.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, MCP-Protocol-Version",
};

interface RpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

const ok = (id: RpcRequest["id"], result: unknown) =>
  NextResponse.json({ jsonrpc: "2.0", id, result }, { headers: CORS });

const fail = (id: RpcRequest["id"], code: number, message: string) =>
  NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { headers: CORS });

function handle(request: RpcRequest) {
  const { method, params = {}, id } = request;

  switch (method) {
    case "initialize": {
      const asked = String(params.protocolVersion ?? "");
      return ok(id, {
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SITE.name, version: SERVER_VERSION },
        instructions: SERVER_INSTRUCTIONS,
      });
    }

    case "ping":
      return ok(id, {});

    case "tools/list":
      return ok(id, { tools: TOOLS });

    case "tools/call": {
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      if (!TOOLS.some((tool) => tool.name === name)) {
        return fail(id, -32602, `Unknown tool "${name}".`);
      }
      try {
        const result = callTool(name, args);
        return ok(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: "error" in result,
        });
      } catch (error) {
        return ok(id, {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        });
      }
    }

    default:
      return fail(id, -32601, `Method "${method ?? ""}" is not supported.`);
  }
}

/** Notifications carry no id and must not get a response body. */
const isNotification = (message: RpcRequest) => message.id === undefined || message.id === null;

export async function POST(request: Request) {
  let body: RpcRequest | RpcRequest[];
  try {
    body = await request.json();
  } catch {
    return fail(null, -32700, "Request body is not valid JSON.");
  }

  if (Array.isArray(body)) {
    const answered = body.filter((message) => !isNotification(message));
    if (!answered.length) return new NextResponse(null, { status: 202, headers: CORS });
    const results = await Promise.all(
      answered.map(async (message) => (await handle(message).json()) as unknown),
    );
    return NextResponse.json(results, { headers: CORS });
  }

  if (isNotification(body)) return new NextResponse(null, { status: 202, headers: CORS });
  return handle(body);
}

export async function GET() {
  return NextResponse.json(
    {
      name: SITE.name,
      description: `${SITE.tagline} Model Context Protocol endpoint.`,
      transport: "streamable-http",
      protocolVersions: PROTOCOL_VERSIONS,
      tools: TOOLS.map((tool) => tool.name),
      usage: "POST JSON-RPC 2.0 to this URL. Start with the initialize method.",
      docs: `${SITE.repo}#model-context-protocol-mcp`,
    },
    { headers: CORS },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
