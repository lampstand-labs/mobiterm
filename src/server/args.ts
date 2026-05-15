import arg from "arg";

const spec = {
  "--help": Boolean,
  "-h": "--help",
  "--vapid-contact": String,
  "-c": "--vapid-contact",
  "--port": String,
  "-p": "--port",
};

function printHelp(): void {
  console.log("Usage: mobiterm <identifier> [options]");
  console.log("");
  console.log("Start a mobiTerm server with a named instance.");
  console.log("");
  console.log("Arguments:");
  console.log(
    "  identifier    Unique name for this instance, used for persistent tmux session and web push configs (required)",
  );
  console.log("");
  console.log("Options:");
  console.log(
    "  -c, --vapid-contact <email|url>    Contact for VAPID push notifications",
  );
  console.log(
    "  -p, --port <number>                Port to listen on (default: 3000)",
  );
  console.log("  -h, --help                         Show this help message");
}

export function parseArgs(): {
  identifier: string;
  vapidContact?: string;
  port?: number;
} {
  const args = arg(spec);

  if (args["--help"]) {
    printHelp();
    process.exit(0);
  }

  const identifier = args._[0];
  if (!identifier) {
    printHelp();
    process.exit(1);
  }

  return {
    identifier,
    vapidContact: args["--vapid-contact"],
    port: args["--port"] ? Number(args["--port"]) : undefined,
  };
}
