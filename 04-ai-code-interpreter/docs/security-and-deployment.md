# Security and deployment

## Critical: Python is not securely sandboxed

The current executor runs model-generated Python as a child process on the application host. It sets a session working directory, removes environment variables whose names resemble secrets, uses Python isolated mode (`-I`), and applies a timeout. These are useful controls, but they do **not** prevent Python from accessing host resources, starting subprocesses, using the network, or reading accessible filesystem paths.

Do not expose this implementation to untrusted or multi-tenant users on a host containing sensitive data or credentials.

## Required production design

Run every execution inside a separately constrained runtime, for example Docker, gVisor, Firecracker, or a managed code-execution service. At minimum, enforce:

- no network access by default;
- read-only application image and a per-run writable scratch directory;
- non-root user;
- CPU, memory, process-count, disk-quota, and execution-time limits;
- a separate container/microVM per run or tenant;
- automatic cleanup of expired session data;
- file-content scanning and stricter artifact allowlists where appropriate.

Treat the current `data/sessions` filesystem store as development-only. In production, use object storage or a managed volume with per-tenant access controls, expiration, and observability.

## API and operational controls

- Add authentication and authorization before making any API route public.
- Add per-user/IP rate limits and request-size limits.
- Validate file content, not only extensions, before making it available to Python.
- Keep `OPENAI_API_KEY` only in server environment configuration; never expose it to the client.
- Log session IDs, execution duration, exit status, and resource-limit events without logging uploaded private data or secrets.
- Configure CORS deliberately if the application will be called cross-origin.

## Deployment considerations

Next.js route handlers use Node.js capabilities (`child_process`, `fs`, and streaming). Deploy to a Node runtime with writable storage and a suitable execution isolation service; an edge runtime is not appropriate. The chat route currently sets `maxDuration = 60`, so ensure the hosting platform permits that duration or adjust the design to use asynchronous jobs.

## Maintenance checklist

1. Update Node, Next.js, LangChain, and Python dependencies regularly.
2. Run `npm run lint` and `npm run build` in CI.
3. Add automated API tests for invalid session IDs, unsupported uploads, traversal attempts, stream parsing, and timeout behavior.
4. Monitor dependency advisories and execution failures.
5. Test cleanup/retention jobs and incident recovery for session artifacts.
