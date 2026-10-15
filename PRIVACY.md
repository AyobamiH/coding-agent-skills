# Coding Agent Skills privacy policy

Effective date: 2026-10-13. Publisher: ayobamih.

Coding Agent Skills is a package of instructions and scripts that run in the
agent host you choose. It does not operate an audit server, create user accounts,
use advertising or analytics, or send repository contents to the publisher.

## Data processed

The scripts inspect the local repository selected for the task: source files,
manifests, documentation, configuration names and local Git metadata. Results can
include repository paths, branch and commit identifiers, source structure, variable
names, warnings and redacted risk indicators. Static secret detection necessarily
processes permitted source text but does not intentionally return matched secret
values. Secret-bearing files such as `.env`, credential stores and private keys
are excluded from the supported audit workflow. Do not use audit output as proof
that all sensitive information has been found or removed.

## Processing, storage and sharing

The bundled audit runner has no network service integration and does not upload
audit data to the publisher. It returns results to the agent host. Your host
provider, including ChatGPT or Codex when used, processes conversations, tool
results and files according to its own terms, privacy policy and account settings.
The package does not make host processing offline or change those settings.

The audit runner does not persist a separate publisher-controlled audit history.
Your conversation, checkout, host logs and any exports you request may remain in
your own or your host's storage. Manage access, retention and deletion through
those systems. The publisher cannot delete records held by your host on your behalf.

## Support and changes

Support is available through
[repository issues](https://github.com/OneClickPostFactory/coding-agent-skills/issues).
Issues are public and processed by GitHub; do not include private source, personal
data, credentials or unredacted audit output. Describe the problem with a minimal
synthetic example. Updated package versions may update this policy; review the
policy distributed with the version you install.
