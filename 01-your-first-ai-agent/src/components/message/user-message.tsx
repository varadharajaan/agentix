import type { UIMessage } from "ai";

export function UserMessage({ message }: { message: UIMessage }) {
  const text = message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-[15px] text-primary-foreground">
        {text}
      </div>
    </div>
  );
}
