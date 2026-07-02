import { createServer } from 'node:http';
import { getVercelRequestHandler } from './apps/api/src/vercel-handler';

const server = createServer(async (request, response) => {
  try {
    const handler = await getVercelRequestHandler();
    handler(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end('Internal Server Error');
  }
});

server.listen(Number(process.env.PORT ?? 3000));
