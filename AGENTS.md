# ResultReach — Onboarding

## Skills & Guidelines

The following skills are installed as native Claude Code skills (use `/skills` to browse):

- **memory-curator**

## Client context lives in `../../context/`

This repo knows how the deliverable is built; `context/` knows what is true about the client. Read it before you write copy, claims, product pages or anything client-facing. Start with `README.md` there (it wins over this file on client facts).

| When you are… | Open first |
|---|---|
| starting or resuming work | `../../context/working/status.md`, then this project's file under `projects/` |
| writing any public claim (numbers, warranties, capabilities) | `../../context/profile/claims-rules.md` |
| building a product or service page | `../../context/sources/` (verified extracts) and `../../context/profile/products.md` |
| about to ask the client something | `../../context/client-answers/CLIENT-QUESTIONS.md` (open) and `ARCHIVE.md` beside it (answered; an older `ANSWERS.md` there still counts until AgencyPilot's Fix format card folds it into `ARCHIVE.md`): never ask twice |
| about to re-open a decision | `../../context/decisions/DECISIONS.md` |
| choosing imagery | the asset library below |

**Assets:** query the manifest, never browse the tree: `../../context/assets/_index/assets.json`.
- Obey `restrict:*`. Don't publish `people:faces` without provenance; `overlay:true` is finished creative, not photography. Look at the thumbnail before placing anything.
- Copy assets into this repo (use `make_web.py --only` when it exists); never link to, move or rename the originals.
- New media (photos Brady sends, images you generate or download) goes to the client's asset inbox, `../../context/assets/_inbox/`, never a folder in this repo; copy into the repo only what a page uses. In an AgencyPilot thread, add it with `assets_inbox_add`; elsewhere, tell Brady which files to put there. The client chat files the inbox into the library.

**Write scope:** you read `context/` but don't edit it. In an AgencyPilot thread, update this project's status, roadmap and Owed-by-Brady lines only through AgencyPilot's record tools, and propose client questions and decisions with them; outside an AgencyPilot thread, report status changes, questions and decisions in your final message.
Wrong or missing client facts: flag them in your hand-off; don't fix them in `context/`.

**What goes where:** `context/` holds what is true about the client and the engagement, in business terms: facts, decisions, scope, milestones, and what shipped, what's next and what's owed as outcomes. How a repo is built belongs in that repo's own docs (`docs/ai-context/`, README): never put file paths, code names, commands, ports, build or test results, or commit ids into `context/` or the client records.

**Credentials:** this repo's `.env` is for this repo; `context/.env.local` is Brady's. Never copy values into markdown, code comments or messages.

## AgencyPilot tools

Pass this project's slug to every `mcp__agencypilot__*` tool.
- Recall first: `search_project_memory` (then `list_decisions`, `get_wiki_page`).
- Record code and implementation decisions with `log_decision`; notes with `capture_to_memory` or `append_log`.

In an AgencyPilot thread (not a Claude Code or Codex session opened on its own) you also have:
- Client records: `engagement_status_set`, `roadmap_update`, `roadmap_propose`, `owed_add`, `question_propose`, `decision_propose`.
- Hand off a subtask: `agent_list_profiles`, then `agent_delegate` (results come back as a validated envelope).
- Work in another project of this client: `dispatch_to_project` (one project, mode write for changes) or `fanout` (several); never edit a sibling repo or leave it a spec to find.

---

**IMPORTANT: Do NOT edit anything above this line.** It is AgencyPilot's agency standard (v6) and this project's settings, rewritten when either changes. Write this project's own notes (what it is, how to run it, its quirks) in the Agent Memory section below.

## Agent Memory

<!-- This section is preserved when AGENTS.md is regenerated. Write project-specific notes, decisions, learned context, and memory here. Everything above this section is auto-generated — do not modify it. -->