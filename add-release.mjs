// Adds an nREPL release tag to the tag list in antora-playbook.yml.
//
//   node add-release.mjs v1.9.0
//
// A new minor version is appended. A patch release replaces the tag of the same
// minor version, since both are published as the same docs version, unless the
// listed tag is as new (its -antora tag, say). When the playbook changes, the
// commit message for it is printed to stdout.

import { readFileSync, writeFileSync } from "node:fs";

const PLAYBOOK = "antora-playbook.yml";
const tag = process.argv[2];

if (!/^v\d+\.\d+\.\d+$/.test(tag ?? "")) {
  console.error("Usage: node add-release.mjs <vX.Y.Z>");
  process.exit(1);
}

const minor = (ref) => ref.split(".").slice(0, 2).join(".");
const patch = (ref) => parseInt(ref.split(".")[2], 10);
const playbook = readFileSync(PLAYBOOK, "utf8");

const list = playbook.match(/^(\s*tags: )\[(.*)\]$/m);
const tags = [...list[2].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const previous = tags.find((existing) => minor(existing) === minor(tag));

// Rerunning an older release's workflow mustn't roll its docs back.
if (previous && patch(previous) >= patch(tag)) {
  console.error(`${previous} is already listed`);
  process.exit(0);
}
if (previous) {
  tags[tags.indexOf(previous)] = tag;
} else {
  tags.push(tag);
}

const rendered = `${list[1]}[${tags.map((t) => `'${t}'`).join(", ")}]`;
// A replacer function, so that a `$` in the playbook isn't read as a pattern.
writeFileSync(PLAYBOOK, playbook.replace(list[0], () => rendered));

const version = tag.slice(1);
console.log(
  previous
    ? `Update nREPL ${minor(version)} to ${version}`
    : `Add nREPL ${minor(version)}`,
);
