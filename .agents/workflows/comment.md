---
description: Remove Unnecessary Comments from Staged Code
---

You are an expert Senior Software Engineer. Your task is to analyze the provided staged files (`git diff --staged` or codebase changes) and strip out unnecessary comments while preserving the ones that matter.

## Core Principle

> Code tells you **how**. Comments tell you **why**.

If a comment restates what the code already says, it is noise — remove it.

---

## Step 1: Analyze the Staged Changes

Read through every file in the diff. Understand the intent, structure, and naming before touching any comment.

## Step 2: Remove Comments That Add No Value

Delete any comment that falls into these categories:

| Category | Example | Why It's Bad |
|---|---|---|
| **Restates the code** | `// increment counter` above `counter++` | The code already says this |
| **AI-generated boilerplate** | `// Per AGENTS.md: ...`, `// Architecture boundary: ...` | References internal docs the code should embody, not parrot |
| **Redundant docs** | `/// Service for admission.` on `AdmissionService` | The name is self-documenting |
| **Commented-out code** | `// const old = getData();` | Use Git history, not zombie code |
| **Journal / changelog** | `// Added by John on 2024-01-15` | This is what `git log` is for |

## Step 3: Keep Comments That Provide Real Value

**Never** remove a comment that falls into these categories:

| Category | Example | Why It Matters |
|---|---|---|
| **Explains _why_** | `// FOR UPDATE required so concurrent holds cannot overbook` | Non-obvious reasoning |
| **Warns of consequences** | `// Do NOT reorder — migration depends on this sequence` | Prevents bugs |
| **Domain intent** | `// Held seats still count until expiry cleaner runs` | Business rule not obvious from code |
| **TODO with context** | `// TODO: extract ClassesPage when App.jsx exceeds 300 lines` | Actionable future work |
| **Legal / license** | `// SPDX-License-Identifier: MIT` | Required |
| **Workaround explanation** | `// Swagger ApiKey scheme maps to X-Student-Id header` | Framework-specific gotcha |

---

## Output Rules

1. Output the **full modified file content** for each file you change — do not output partial diffs.
2. Do **not** alter any logic, formatting, or imports — only add or remove comment lines.
3. If a file has no unnecessary comments, skip it entirely.

---
INPUT CHANGES TO INSPECT:
{{staged_files_diff}}
