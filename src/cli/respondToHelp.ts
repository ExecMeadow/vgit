import resolvePositionals from "../engine/resolvePositionals.js";
import {
  renderCommandUsage,
  renderDescription,
  renderProgramUsage,
  renderAvailableCommands,
  renderAvailableDomains,
  renderNewLine,
  renderDomain,
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
    case "root": {
      renderProgramUsage();
      renderNewLine();
      const domains = discoverDomains(node);
      renderAvailableDomains(domains);
      break;
    }
    case "group":
    case "domain": {
      renderDomain(positionals[0]);
      renderDescription(node.description);
      renderNewLine();
      const commands = discoverCommands(node, [positionals[0]]);
      renderAvailableCommands(commands);
      break;
    }
  }
  return {};
}
