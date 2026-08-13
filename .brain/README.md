# ⚠️ This directory belongs at the workspace root, not in this repo

These files were generated inside `Firm-Foundation/` because the target path
`C:\Users\cceli\workspace\.brain\` is **not reachable** from the Linux container
this session runs in (no `/mnt/c`, no Windows drive mount, and only the
`Firm-Foundation` repo is in scope).

**Move this whole `.brain/` directory to `C:\Users\cceli\workspace\.brain\`**, then
delete it from this repo. The contents are complete and correct — only the
location is wrong.

```
workspace/
├── .brain/                  ← move it here
│   ├── 01-Projects/
│   ├── 02-Context/
│   ├── 03-App-State/
│   └── 04-Logs/
├── 1-wholesale-real-estate/
├── 2-permit-ai/
└── 3-the-firm-foundation/
```

---

## Workspace-root `CLAUDE.md` snippet

Phase 1.5 asked for the workspace-level `CLAUDE.md` to auto-read `.brain/` on
session start. That file lives outside this container, so it was not written —
paste the block below into `C:\Users\cceli\workspace\CLAUDE.md` yourself.

```markdown
## Second Brain — read on session start

Before doing anything else in this workspace, read `.brain/`:

| File | Purpose |
|---|---|
| `.brain/02-Context/preferences.md` | Communication standard and theological guardrails. **Applies to every response.** |
| `.brain/03-App-State/apps-overview.md` | The three projects, their stacks, and local model/container endpoints. |
| `.brain/01-Projects/*.md` | Per-project integration notes. |
| `.brain/04-Logs/session-log.md` | What previous sessions changed. Append, don't overwrite. |

Rules:
- `.brain/02-Context/preferences.md` overrides default formatting behaviour.
- Append a dated entry to `.brain/04-Logs/session-log.md` at the end of any
  session that changed code.
- Never guess a project's stack — check `apps-overview.md` first.
```
