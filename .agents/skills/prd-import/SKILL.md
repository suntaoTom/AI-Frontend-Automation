---
name: prd-import
description: Convert non-markdown requirements documents (.docx / .xlsx / .pptx) into markdown drafts as input material for /prd. Triggered when the user says "here's a doc/Excel/PPT from the PM, convert it to a PRD", "requirements are in xxx.docx", or "generate a PRD from Word". PDFs and images go through Codex's native Read tool and do not use this skill.
---

# prd-import — Requirements Document Format Conversion

Converts **non-markdown** requirements (Word / Excel / PPT) provided by the backend or PM into markdown, saved to `docs/prds/_imports/`, for use as source input by the `/prd` command.

## Scope of Responsibility

**Does**:
- Detect the input file format and invoke the corresponding script to convert it to markdown
- Preserve structure (headings / lists / tables), discard styles
- Save the output to `docs/prds/_imports/<basename>-<date>.md` with a conversion metadata header
- Prompt the next step: `/prd @<output path>`

**Does NOT**:
- ❌ Directly generate a PRD draft — that is `/prd`'s job; this skill only handles "translation"
- ❌ Perform any business judgment / rule inference / field completeness checks
- ❌ Modify any workspace code
- ❌ Process .pdf / images — Codex natively supports these; run `/prd @<pdf or image>` directly

## Supported Input Types

| Format | Supported | Conversion Library | Notes |
|--------|-----------|--------------------|-------|
| `.docx` | ✅ | mammoth | Word 2007+ format |
| `.doc` | ❌ | — | Legacy Word format; please "Save As .docx" first |
| `.xlsx` | ✅ | xlsx | Each sheet is converted into a markdown table |
| `.xls` | ❌ | — | Legacy Excel format; please save as .xlsx |
| `.pptx` | ✅ (best-effort) | built-in unzip | Text extracted per slide; layout not preserved |
| `.md` / `.txt` | ✅ | pass-through | Copied directly with a conversion header added |
| `.pdf` | ❌ (use native) | — | Run `/prd @<file>.pdf` directly |
| Images (.png/.jpg) | ❌ (use native) | — | Run `/prd @<file>.png` directly |
| **Online docs** (Feishu/Notion/Yuque/Google Docs, etc.) | ❌ (export first) | — | Export from the platform as `.md` or `.docx`, then follow the table above. See [references/formats.md](references/formats.md#在线文档怎么办) |

For detailed format notes and known issues, see [references/formats.md](references/formats.md).

## Execution Flow

### Step 1: Pre-flight Check (First Use)

Dependencies are installed in `workspace/`:

```bash
# Check if already installed
cd workspace && pnpm list mammoth xlsx 2>/dev/null | grep -E "mammoth|xlsx"
```

If the output is empty, tell the user to install once:

```bash
cd workspace && pnpm install
# Or install just the two missing packages
cd workspace && pnpm add -D mammoth xlsx
```

### Step 2: Run the Conversion Script

From the repository root:

```bash
pnpm prd:import <input file path>
```

Or invoke node directly (bypassing the pnpm proxy):

```bash
node workspace/scripts/prd-import.mjs <input file path>
```

Script behavior:
- Automatically dispatches to the correct handler based on file extension
- Default output path: `docs/prds/_imports/<original filename>-<YYYY-MM-DD>.md`
- On conflict, automatically appends `-2` / `-3` suffix; never overwrites existing files
- Prepends a metadata comment to the output (source file / format / conversion date / character count)

### Step 3: Read Conversion Result + Prompt Next Step

After the script finishes, skim the output (around 200 lines — don't read all of it to avoid blowing the context), then tell the user:

```
✅ Conversion complete
  Source:   requirements/login-requirements.docx (docx, 124 KB)
  Output:   docs/prds/_imports/login-requirements-2026-04-20.md (342 lines)
  Word count: 4821 characters

⚠️ Notes:
  - Tables have been converted to markdown format; complex merged cells may be misaligned
  - Images were not extracted (if you need to reference design specs, manually add Figma links to the PRD)
  - The output is a "raw translation", not a final PRD. Next step:

Next step:
  /prd @docs/prds/_imports/login-requirements-2026-04-20.md
```

## Output Markdown File Format

```markdown
<!--
  Generated: 2026-04-20 14:32
  Source: /path/to/login-requirements.docx
  Format: docx (mammoth v1.8.0)
  Size: 124 KB, 3521 characters
-->

# <Title extracted from source file>

<Body content with preserved heading levels + lists + tables>

## ...
```

## Failure Triage

| Failure | Cause | Action |
|---------|-------|--------|
| `Cannot find module 'mammoth'` | `pnpm install` not run | Tell user to run `cd workspace && pnpm install` |
| `.doc (non-docx) files are not supported` | Legacy format | Ask user to save as .docx using Word / WPS |
| Table misalignment / merged cells lost | mammoth limitation | Note it and suggest manual review; this is not a bug |
| Empty output / garbled content | Source file may be encrypted or corrupted | Ask user to verify the source file opens correctly |
| File > 10MB takes a long time | Normal; script does no truncation | Wait |

## Design Principles

- **Pure data conversion, zero inference** — this skill performs no semantic understanding; that is `/prd`'s job
- **Script produces data, AI provides guidance** — conversion uses a Node script (reproducible); AI only reads the output and guides the next step
- **Traceable output** — source file path and format are preserved so the original can be referenced during PRD review
- **No overwrite** — same-named files in `_imports/` automatically get a suffix to prevent accidental deletion
- **Minimal dependencies** — only `mammoth` + `xlsx` are required; other formats rely on Node built-ins

## Usage Example

```
User: The PM gave me a Word requirements doc at requirements/login-requirements.docx, help me turn it into a PRD
    ↓
AI: First run prd-import to convert the docx to md, then run /prd through the clarification flow

# Step 1: Convert
$ pnpm prd:import requirements/login-requirements.docx
→ docs/prds/_imports/login-requirements-2026-04-20.md

# Step 2: Run the normal PRD flow
/prd @docs/prds/_imports/login-requirements-2026-04-20.md
→ AI asks 3-5 clarifying questions → generates docs/prds/login.md
```
