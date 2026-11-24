import { GitCommandTree } from "../types.js";

export default function discoverDomains(node: GitCommandTree): string[] {
  const domains = Object.keys(node).filter(
    (domain) => domain !== "type" && domain !== "description",
  );
  return domains;
}
