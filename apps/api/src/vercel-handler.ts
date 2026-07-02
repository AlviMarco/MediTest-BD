import type { IncomingMessage, ServerResponse } from 'node:http';
import { createMediTestApp } from './bootstrap';

type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void;

let cachedHandler: Promise<RequestHandler> | undefined;

async function createHandler() {
  const { app } = await createMediTestApp();
  await app.init();
  return app.getHttpAdapter().getInstance() as RequestHandler;
}

export async function getVercelRequestHandler() {
  cachedHandler ??= createHandler();
  return cachedHandler;
}
