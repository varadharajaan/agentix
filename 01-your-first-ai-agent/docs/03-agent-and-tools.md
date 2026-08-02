# Agent and Tools

## Agent configuration

`src/agent/graph.ts` creates the LangChain agent. Its system prompt asks for concise Markdown responses and directs the model to call tools when they offer better accuracy or current information. `streamAgent` enables both message and tool streaming.

`src/agent/model.ts` configures a streaming `ChatOpenAI` model:

| Setting | Value |
| --- | --- |
| Model | `OPENAI_MODEL`, otherwise `gpt-5.5-mini` |
| Temperature | `0.4` |
| Key | `OPENAI_API_KEY` |
| Base URL | `OPENAI_BASE_URL`, when supplied |
| Streaming | Enabled |

## Tool registry

`src/agent/tools/index.ts` exports the shared `tools` array. Adding a tool there makes it available to the agent and lists it in the sidebar.

### `get_weather`

Input: `{ "location": "Tokyo, Japan" }`

The tool geocodes the place using Open-Meteo, then requests current weather. The result can include normalized location, temperature, feels-like temperature, humidity, wind, weather code, and observation time. An unrecognized place returns an error object.

### `calculator`

Input: `{ "expression": "18% * 240" }`

The tool evaluates a `mathjs` expression and returns the expression plus its string result. Invalid expressions return an error object.

## Add a tool

1. Create `src/agent/tools/<tool-name>.ts` with LangChain `tool`, a Zod schema, and an async handler.
2. Add it to the exported `tools` array in `index.ts`.
3. Add optional icon/label metadata to `ToolCallPart` for a tailored UI card.
4. Test the prompt, streamed execution state, result, and expected failure behavior.

Tool descriptions are part of the model’s decision context. Keep them specific, validate all input, constrain external calls, and never expose secrets in returned output.
