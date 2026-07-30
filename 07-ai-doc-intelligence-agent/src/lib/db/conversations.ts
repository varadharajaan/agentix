import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import type {
  Citation,
  ConversationRecord,
  MessageRecord,
  MessageRole,
} from "@/lib/types";

interface MessageRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  citations: string | null;
  created_at: string;
}

function rowToMessage(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as MessageRole,
    content: row.content,
    citations: row.citations ? JSON.parse(row.citations) : null,
    createdAt: row.created_at,
  };
}

export function createConversation(
  title = "New conversation",
): ConversationRecord {
  const id = randomUUID();
  db.prepare(`INSERT INTO conversations (id, title) VALUES (?, ?)`).run(
    id,
    title,
  );
  return db
    .prepare(`SELECT * FROM conversations WHERE id = ?`)
    .get(id) as ConversationRecord;
}

export function listConversations(): ConversationRecord[] {
  return db
    .prepare(`SELECT * FROM conversations ORDER BY updated_at DESC`)
    .all() as ConversationRecord[];
}

export function addMessage(input: {
  conversationId: string;
  role: MessageRole;
  content: string;
  citations?: Citation[] | null;
}): MessageRecord {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO messages (id, conversation_id, role, content, citations)
     VALUES (@id, @conversationId, @role, @content, @citations)`,
  ).run({
    id,
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    citations: input.citations ? JSON.stringify(input.citations) : null,
  });

  db.prepare(
    `UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`,
  ).run(input.conversationId);

  const row = db
    .prepare(`SELECT * FROM messages WHERE id = ?`)
    .get(id) as MessageRow;
  return rowToMessage(row);
}

export function getMessages(conversationId: string): MessageRecord[] {
  const rows = db
    .prepare(
      `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
    )
    .all(conversationId) as MessageRow[];
  return rows.map(rowToMessage);
}
