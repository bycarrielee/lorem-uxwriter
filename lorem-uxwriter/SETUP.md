# Lorem skill — setup guide

This guide installs Lorem as a Claude Code skill on your machine. Once installed, invoke it with `/lorem-uxwriter` from any project in Claude Code.

## Requirements

- Claude Code installed and configured
- Access to your `~/.claude/skills/` directory

## Install

1. From the repository root, run:

   ```bash
   cp -r lorem-uxwriter ~/.claude/skills/lorem-uxwriter
   ```

   The installed structure should look like:

   ```
   ~/.claude/skills/lorem-uxwriter/
   ├── SKILL.md
   ├── SETUP.md
   ├── foundations/
   │   ├── global/
   │   └── products/
   ├── patterns/
   │   ├── global/
   │   └── products/
   └── library/
       ├── global/
       └── products/
   ```

2. Verify Claude Code recognises the skill. Open any project in Claude Code and run:

   ```
   /lorem-uxwriter Hello
   ```

   You should see a response that includes a source label (for example, `AI-generated`), a suggested copy, a rationale, a readability grade, and a confidence level.

## Update after content changes

When files change in the repository, re-run the install command to sync:

```bash
cp -r lorem-uxwriter ~/.claude/skills/lorem-uxwriter
```

## Add product overrides

These instructions assume you have a local clone of the repository. If you installed the skill directly into `~/.claude/skills/lorem-uxwriter/`, create the override files there instead and skip the install command.

To override global foundations or patterns for a specific product, create override files in `lorem-uxwriter/`:

```
lorem-uxwriter/foundations/products/my-product/voice.md
lorem-uxwriter/patterns/products/my-product/buttons.md
```

The file only needs to contain the overrides — Lorem reads the product file first and falls back to global for anything not overridden.

Re-run the install command to pick up the changes.

## Add product library entries

To add a product copy library, create a folder under `lorem-uxwriter/library/products/`:

```
lorem-uxwriter/library/products/my-product/copy-entries.json
```

The file must be a JSON array. Minimum required fields per entry:

```json
[
  {
    "id": "my-product-001",
    "element_type": "errors",
    "copy": "Enter a valid email address.",
    "context": "Inline error on the email field.",
    "status": "active"
  }
]
```

Re-run the install command, then invoke Lorem with the product name:

```
/lorem-uxwriter [your copy]
Product: My Product
```

## Feedback

Report issues or suggest improvements by emailing carrie_lee@tech.gov.sg

