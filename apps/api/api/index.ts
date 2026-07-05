import type { IncomingMessage, ServerResponse } from 'node:http';
import { getVercelRequestHandler } from '../src/vercel-handler';

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  restoreRewrittenApiPath(request);
  const app = await getVercelRequestHandler();
  return app(request, response);
}

function restoreRewrittenApiPath(request: IncomingMessage) {
  if (!request.url) return;

  const url = new URL(request.url, 'https://meditest.local');
  const rewrittenPath =
    url.searchParams.get('__path') ?? url.searchParams.get('path');
  if (!rewrittenPath) return;

  url.searchParams.delete('__path');
  url.searchParams.delete('path');
  const normalizedPath = `/api/${rewrittenPath.replace(/^\/+/, '')}`;
  const query = url.searchParams.toString();
  request.url = query ? `${normalizedPath}?${query}` : normalizedPath;
}
