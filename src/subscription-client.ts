import { createClient } from "graphql-ws";
import WebSocket from "ws";

const url = process.env.GRAPHQL_WS_URL ?? "ws://localhost:4010/graphql";

const client = createClient({
  url,
  webSocketImpl: WebSocket,
});

console.log(`Listening for subscription events on ${url}`);

const disposeCreated = client.subscribe(
  {
    query: `
      subscription OnUserCreated {
        userCreated {
          id
          name
          email
        }
      }
    `,
  },
  {
    next: (data) => console.log("[userCreated]", JSON.stringify(data)),
    error: (error) => console.error("[userCreated:error]", error),
    complete: () => console.log("[userCreated] complete"),
  },
);

const disposeDeleted = client.subscribe(
  {
    query: `
      subscription OnUserDeleted {
        userDeleted
      }
    `,
  },
  {
    next: (data) => console.log("[userDeleted]", JSON.stringify(data)),
    error: (error) => console.error("[userDeleted:error]", error),
    complete: () => console.log("[userDeleted] complete"),
  },
);

const disposePatched = client.subscribe(
  {
    query: `
      subscription OnUserPatched {
        userPatched {
          id
          name
          email
        }
      }
    `,
  },
  {
    next: (data) => console.log("[userPatched]", JSON.stringify(data)),
    error: (error) => console.error("[userPatched:error]", error),
    complete: () => console.log("[userPatched] complete"),
  },
);

const shutdown = () => {
  disposeCreated();
  disposeDeleted();
  disposePatched();
  console.log("Subscription listener stopped.");
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
