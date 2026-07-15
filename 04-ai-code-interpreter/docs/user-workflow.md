# User workflow

1. Open the application. It automatically creates a new isolated session.
2. Use the sidebar to upload data files or images. Uploaded files appear in the file list.
3. Write a concrete request in the prompt bar. Mention the uploaded filename when useful.
4. Follow the run card as it moves through understanding, file inspection, Python generation, execution, recovery, artifact saving, and explanation.
5. Read the summary and inspect execution output if required.
6. Open or download generated artifacts from the artifacts panel/sidebar.
7. Continue in the same browser session for follow-up analysis. The app provides prior completed prompt/explanation pairs to the model and keeps files in the session directory.

## Example prompts

- “Inspect `sales.csv`, identify missing values, and save a cleaned copy as `sales_clean.csv`.”
- “Create a monthly revenue trend chart from `orders.xlsx`; save it as `monthly_revenue.png`.”
- “Produce a PDF summary of the numerical columns in `survey.csv`.”

## What to expect

- Printed Python output appears as execution output, but only files written to disk become downloadable artifacts.
- The model may make multiple Python calls when a task needs intermediate inspection or error recovery.
- Each Python call is a new interpreter process. Persist important results by saving them to files rather than relying on variables from a previous call.
- File changes are detected by name and modification time, so write output using descriptive, stable filenames.
