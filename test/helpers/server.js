import getPort from "get-port";
import httpServer from "http-server";

export default async (t) => {
  const port = await getPort();
  const server = httpServer.createServer();
  server.listen(port, "0.0.0.0");
  t.context.server = server;
  t.context.port = port;
};
