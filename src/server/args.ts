import arg from "arg";
import pkg from "../../package.json";

const spec = {
  "--help": Boolean,
  "-h": "--help",
  "--version": Boolean,
  "-v": "--version",
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
    "  -c, --vapid-contact <email|url>    Contact for VAPID push notifications (default: admin@<identifier>.com)",
  );
  console.log(
    "  -p, --port <number>                Port to listen on (default: 7130)",
  );
  console.log("  -h, --help                         Show this help message");
  console.log("  -v, --version                      Show version number");
}

export function parseArgs(): {
  identifier: string;
  vapidContact?: string;
  port?: number;
} {
  const args = arg(spec);

  if (args["--version"]) {
    console.log(`${pkg.name} ${pkg.version}`);
    process.exit(0);
  }

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
