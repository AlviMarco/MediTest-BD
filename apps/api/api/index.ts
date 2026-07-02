import type { IncomingMessage, ServerResponse } from 'node:http';
import { getVercelRequestHandler } from '../src/vercel-handler';

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const app = await getVercelRequestHandler();
  return app(request, response);
}
