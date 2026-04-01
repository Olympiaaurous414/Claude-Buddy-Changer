# Claude Buddy Changer

`buddy-lab.js` is a local analysis tool that reproduces the deterministic
Buddy roll logic from the public source mirror without modifying Claude Code.

It supports:

- auto-detecting `userId` from local Claude config
- previewing a buddy for a given `userId + salt`
- searching candidate salts offline and printing matches

Examples:

```bash
cd /home/ec2-user/claude-buddy-changer
node buddy-lab.js preview
node buddy-lab.js preview --salt friend-2026-401
node buddy-lab.js search --species owl --rarity rare --total 500000
node buddy-lab.js search --shiny --min-stat CHAOS:80
```

Notes:

- This tool is for local analysis and planning your own companion system.
- It does not patch binaries or change Claude Code behavior.

Open the local web preview:

```bash
cd /home/ec2-user/claude-buddy-changer
node server.js
```

Then open:

```text
http://127.0.0.1:43123
```
