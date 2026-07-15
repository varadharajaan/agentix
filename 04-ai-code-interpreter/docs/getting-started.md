# Getting started

## Prerequisites

- Node.js compatible with Next.js 16
- npm
- Python 3 available as `python` on Windows or `python3` on macOS/Linux
- An OpenAI API key

## Install

From the project root:

```bash
npm install
python -m pip install -r src/python-sandbox/requirements.txt
```

The bundled Python requirements install Pandas, NumPy, Matplotlib, OpenPyXL, and ReportLab. They enable common spreadsheet analysis, charts, Excel files, and PDF reports.

## Configure environment variables

Create `.env.local` in the project root. Do not commit it.

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6

# Optional controls
MAX_AGENT_RETRIES=3
PYTHON_EXEC_TIMEOUT_MS=20000
# PYTHON_BIN=python
# PYTHON_BIN_ARGS=
```

`OPENAI_MODEL` may be omitted if the provider defaults are suitable. The agent intentionally does not set a temperature because reasoning models may reject non-default values.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`. Start a new session, upload files if needed, and submit a request such as: “Summarize this CSV and save a chart as a PNG.”

## Production commands

```bash
npm run lint
npm run build
npm run start
```

The current lint run has no errors, but reports unused-import warnings. If a Windows build reports `EPERM` for `.next/trace`, first stop other Next.js/Node processes that may hold the trace file, then retry. This is an operating-system lock/permission issue rather than a TypeScript lint failure.

## Runtime directories

Session data is stored beneath:

```text
data/sessions/<session-id>/
  manifest.json
  files/
```

The `files/` directory contains both user uploads and Python-generated artifacts. The manifest records which filenames were uploaded so the UI can label their origin.
