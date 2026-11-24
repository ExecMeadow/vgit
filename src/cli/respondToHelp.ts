import resolvePositionals from "../engine/resolvePositionals.js";
import {
  renderCommandUsage,
  renderDescription,
  renderProgramUsage,
  renderAvailableGitCommands,
  renderAvailableDomains,
} from "../terminal-ui/render.js";
import discoverCommands from "../engine/discoverCommands.js";
import discoverDomains from "../engine/discoverDomains.js";
import { Error } from "../types.js";

// respond to --help and help
export default function respondToHelp(positionals: string[]): {
  error?: Error;
} {
  const { error: positionalsError, node } = resolvePositionals(positionals);
  if (positionalsError) {
    return { error: positionalsError };
  }
  switch (node.type) {
    case "command": {
      renderCommandUsage(node.usage);
      renderDescription(node.description);
      break;
    }
    case "group": {
      if (positionals.length === 0) {
        renderProgramUsage();
        const domains = discoverDomains(node);
        renderAvailableDomains(domains);
      } else {
        const commands = discoverCommands(node);
        renderAvailableGitCommands(commands);
      }
    }
  }
  return {};
}
