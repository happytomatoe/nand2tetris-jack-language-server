import {
  Connection,
  createConnection,
  ProposedFeatures,
} from "vscode-languageserver/node";

import { JackServer } from "./serverInit";

// Create a connection for the server.
const connection: Connection =
  process.argv.indexOf("--stdio") === -1
    ? createConnection(ProposedFeatures.all)
    : createConnection();

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
console.error = (arg) => {
  if (arg === null) {
    connection.console.info(arg);
  } else {
    connection.console.error(arg);
  }
};

new JackServer(connection).start();
