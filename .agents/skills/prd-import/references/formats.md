# Format Details & Known Issues

## .docx (Word 2007+)

### Library used: [mammoth](https://github.com/mwilliamson/mammoth.js)

- Output: uses the `convertToMarkdown` API; preserves headings (H1-H6) / paragraphs / lists / tables / blockquotes
- Not preserved: font colors, font sizes, images (images are extracted but discarded by this script)
- `.doc` (legacy OLE compound document format) is not supported; ask users to save as `.docx`

### Known Limitations

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| Merged cells misaligned | mammoth expands colspan/rowspan into multiple empty columns | Manually edit the md to fix |
| Footnotes lost | mammoth does not extract footnotes by default | If requirements rely on footnotes, copy them manually from the source |
| Headers/footers lost | Not part of body content | Usually does not affect understanding of requirements |
| Embedded Excel objects discarded | Cross-format embedding not supported | Ask the PM to export Excel separately |
| Custom styles ignored | mammoth only recognizes semantic styles (Heading / List) | Ask the PM to use standard styles |

### Tips for PMs When Writing Documents (shareable)

- Use Word's built-in **Heading 1-3** styles for headings (don't manually adjust font sizes)
- Use regular rectangular tables; avoid merged cells
- Put images and screenshots in a separate folder; use only text descriptions + reference numbers inside the Word file
- Use numbered lists (Word's List style) for requirement rules; don't manually type "1.", "2."

## .xlsx (Excel 2007+)

### Library used: [SheetJS xlsx](https://github.com/SheetJS/sheetjs)

- Each sheet is converted into a `## <sheet name>` heading + one markdown table
- Empty rows and columns are automatically removed
- Numbers are preserved at their original precision (no currency formatting applied)

### Known Limitations

| Symptom | Cause | Resolution |
|---------|-------|-----------|
| Merged cells retain only the top-left value | Standard xlsx behavior | Ask the PM not to merge cells |
| Formulas are resolved to their computed values | Default xlsx strategy | Requirements docs rarely use formulas; usually no impact |
| Dates converted to Excel serial numbers | xlsx internal storage | The script detects this and converts back to ISO date strings |
| Charts / pivot tables | Non-tabular data | Not supported; ask the PM to provide a flat table version |

## .pptx (PowerPoint 2007+)

### Approach: native unzip + XML regex extraction

- .pptx is essentially a zip archive containing `ppt/slides/slide*.xml`
- The script unzips it and uses regex to extract text from each slide
- Each slide is output as `## Slide N` + its text content

### Limitations

This is best-effort, not a full conversion:

| Lost Content | Why |
|-------------|-----|
| Layout / positioning | Meaningless in markdown |
| Images / screenshots | Cannot OCR |
| Animations / transitions | Cannot be expressed |
| Speaker notes | Not extracted by default (modify the script to read `notesSlide*.xml` if needed) |

**Recommendation**: If requirements are primarily expressed through slides, ask the PM to provide a Word or markdown version as well; treat the PPT as supplementary material.

## .pdf

**Does not go through this skill.** Codex can read PDFs directly, and the vision model can handle scanned documents. Use directly:

```bash
/prd @requirements/login-requirements.pdf
```

`/prd` will read the PDF content internally, just like reading a markdown file.

**Exception**: If the PDF is more than 20 pages, `Read` requires specifying a page range. In that case:
1. Open the PDF in a reader and find the key chapter page numbers
2. Read in segments using `@<file.pdf>` pages="1-10" etc.

## Image Requirements (.png / .jpg / .jpeg)

**Does not go through this skill.** Codex multimodal capabilities can recognize requirement screenshots, flowcharts, and prototype images. Use directly:

```bash
/prd @requirements/login-flow.png
```

## Other Formats

| Format | Recommendation |
|--------|---------------|
| `.md` / `.txt` | Use `/prd @<file>` directly; no conversion needed |
| Notion export `.md` + `_imports/` | Use Notion's "Export as Markdown" (includes images); feed directly to `/prd` |
| Feishu / Yuque export `.docx` | Treat as a normal docx |
| Confluence export `.html` | Not currently supported; manually copy content to a .md file |
| DingTalk Docs / Tencent Docs | Export as .docx and run through this skill |

## Character Encoding

The script reads and writes in UTF-8 by default. If the source file uses GBK / GB18030 (occasionally seen in old Windows Word files):
- mammoth handles the internal encoding of docx itself; not affected
- xlsx is the same
- Plain `.txt` files in GBK will trigger a warning and the script will attempt conversion via `iconv-lite` (if installed)

If the output is garbled, ask the user to open the source file in VSCode, change the encoding in the bottom-right corner to UTF-8, and save a copy.

---

## What to Do with Online Documents

PMs often write requirements on platforms like **Feishu / Notion / Yuque / Tencent Docs / Google Docs**. This skill **does not integrate with any platform API**; use one of the following paths instead.

### Path 1 (Recommended): Export to local then run prd-import

Every platform has an export feature; just find it:

| Platform | Export Path | Recommended Format | Output Quality |
|----------|-------------|-------------------|---------------|
| **Feishu Docs** | Top-right `···` More → Export as Word | `.docx` | Good (table structure intact) |
| **Notion** | `Share` → `Export` → `Markdown & CSV` | `.md` ⭐ use directly | Excellent (Notion native md) |
| **Yuque** | More `···` → Export → Markdown | `.md` ⭐ use directly | Good (Yuque native md) |
| **Tencent Docs** | File → Export as → Word | `.docx` | Okay (tables occasionally misalign) |
| **Google Docs** | File → Download → Microsoft Word (.docx) | `.docx` | Good |
| **Confluence** | `···` → Export → Word Document | `.docx` | Good |
| **DingTalk Docs** | More → Export → Word | `.docx` | Okay |
| **Shimo Docs** | Top-right `···` → Export → Word | `.docx` | Okay |
| **Microsoft OneNote/Word Online** | File → Export → .docx | `.docx` | Good |

**Key tips**:
- Platforms with `.md` export (Notion / Yuque): **run `/prd @<file.md>` directly** — no need for prd-import at all
- For other platforms: export `.docx`, then run `pnpm prd:import <file.docx>`, then `/prd @<output>`

**Example walkthrough** (using Feishu):

```
1. The PM sends you a Feishu requirements doc link
2. Open the link; top-right ··· → Export → Word
3. Download to local (e.g., login-requirements.docx)
4. Local commands:
   pnpm prd:import login-requirements.docx
   → docs/prds/_imports/login-requirements-2026-04-20.md
5. /prd @docs/prds/_imports/login-requirements-2026-04-20.md
```

### Path 2 (Advanced, user-configured): MCP

Codex can use MCP servers when they are configured in the local environment. With an MCP server, AI can read online documents directly without manual exports.

**The project does not include any MCP configuration.** Users configure it in their local MCP setup. Once configured, `/prd` can access online content via the tool.

Available MCP servers:

| Platform | MCP Server | Setup Complexity |
|----------|-----------|-----------------|
| **Notion** | [`@notionhq/notion-mcp-server`](https://github.com/makenotion/notion-mcp-server) | ⭐⭐ (requires creating an integration and getting a secret) |
| **Google Drive** | Anthropic official Google Drive MCP | ⭐⭐ (OAuth, one-time authorization) |
| **Feishu / Yuque / Tencent / DingTalk** | Community options, quality varies | ⭐⭐⭐ use at your own risk |

**When it's worth setting up MCP**:
- 80% of the team's requirements live on one platform (e.g., heavy Notion users)
- Requirements iterate frequently and manual exports are high-volume
- There's an auth system that can be configured once and used long-term

**When not to bother**:
- You encounter online docs once a week → manual export is more cost-effective
- Platform not in the table above → writing your own MCP is not worth it
- Documents are sensitive (customer / financial / HR) → don't let AI hold a token

### Path 3 (Not recommended): Have AI scrape the link

Some platforms support public share links, which could theoretically be fetched via `curl` and parsed. **The project does not provide this capability**, because:
- Most internal team documents are not publicly shared
- HTML parsing is brittle; any DOM change breaks it
- High maintenance cost, low payoff

If you genuinely need a one-off scrape of some public URL, use the browser's "Save Page As → Complete HTML" and paste the text manually. Don't expect AI to automate this.

### Why We Don't Build Platform API Integrations

See the corresponding entry in [docs/DECISIONS.md](../../../../docs/DECISIONS.md). In brief:
- Each platform (Feishu / Notion / Yuque / Google) has a completely different auth mechanism; token refresh / permissions / rate limits are all ongoing work
- Platform updates will break integrations; the framework goes from "a tool" to "a maintenance project"
- 90% of teams only use 1-2 platforms; supporting all of them is wasteful
- Path 1 (export) covers all platforms in 3 minutes
