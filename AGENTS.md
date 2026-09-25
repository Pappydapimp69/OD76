## Cognitive system: Brain

This project is linked to Brain. Use the CLI; do not read Brain node repos directly.

Invocation, in order:
1. `brain <cmd>`
2. `python "$HOME/.brain/Brain/bin/brain" <cmd>`
   (Windows PowerShell: `python "$env:USERPROFILE\.brain\Brain\bin\brain" <cmd>`)

Before non-trivial work, run one targeted `brain query <task keywords>`.
Prefer 1-3 concrete keywords. Re-query only when the sub-problem changes.

When useful durable lessons emerge:
1. run `brain mine`
2. follow the printed schema exactly if writing proposals
3. run `brain sync`

Keep output brief. The current Brain stance is `brief`.

## Agent discipline

Minimize repeated repo discovery.

First read:
1. `AGENTS.md`
2. `PROJECT_MAP.md`
3. `TASKS.md`
4. `HANDOFF.md`

Use `rg` before opening broad files. Inspect only files relevant to the current task.
Do not summarize the whole project unless explicitly asked.

## Current Project

`OD76` is its own workspace and tracks `Pappydapimp69/OD76`. It was built
through Codex through B83 and is worked on in Claude Code from B84; the build
rules below are the same either way. `HANDOFF.md` carries the toolchain each
environment needs.

Engine upstream: `Pappydapimp69/Od00` is the shared core engine. OD76 (and
later OD78, OD79, ...) builds on it. Pull engine updates with
`git remote add engine https://github.com/Pappydapimp69/od00` (once), then
`git fetch engine main && git merge engine/main`. Put engine-wide fixes in Od00
first; keep OD76-only features (the Pip ranch) here.
The numbered `b21-*.js` files assemble in numeric order (b21-99 before b21-100); preserve late-module authority and update the complete regression suite when adding a build.
