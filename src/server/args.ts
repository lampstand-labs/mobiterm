import arg from "arg";

const spec = {
  "--help": Boolean,
  "-h": "--help",
  "--vapid-contact": String,
  "-c": "--vapid-contact",
};

function printHelp(): void {
  console.error("Usage: mobiterm <identifier> [options]");
  console.error("");
  console.error("Start a mobiTerm server with a named instance.");
  console.error("");
  console.error("Arguments:");
  console.error(
    "  identifier    Unique name for this server instance (required)",
  );
  console.error("");
  console.error("Options:");
  console.error(
    "  -c, --vapid-contact <email|url>    Contact for VAPID push notifications",
  );
  console.error("  -h, --help                         Show this help message");
}

export function parseArgs(): { identifier: string; vapidContact?: string } {
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

  return { identifier, vapidContact: args["--vapid-contact"] };
}
