import { getMany, executeAction } from "@/lib/db/client";
import { SenderRole } from "@/types";

interface MessageQueryResult {
  id: string;
  consultation_id: string;
  sender_id: string;
  message: string;
  attachment_url: string;
  created_at: string;
  role: string;
}

export async function getMessages(consultationId: string) {
  const rows = await getMany<MessageQueryResult>(
    `SELECT cm.id, cm.consultation_id, cm.sender_id, cm.content as message, 
            cm.message_type as attachment_url, cm.created_at, p.role
     FROM consultation_messages cm
     JOIN profiles p ON cm.sender_id = p.id
     WHERE cm.consultation_id = ?
     ORDER BY cm.created_at ASC`,
    [consultationId]
  );
  return rows.map(row => ({
    id: row.id,
    consultation_id: row.consultation_id,
    sender_id: row.sender_id,
    sender_role: (row.role === 'expert' ? 'DOCTOR' : 'PATIENT') as SenderRole,
    message: row.message,
    attachment_url: row.attachment_url === 'text' ? null : row.attachment_url,
    created_at: row.created_at
  }));
}

export async function sendMessage(data: {
  consultation_id: string;
  sender_id: string;
  sender_role: SenderRole;
  message: string;
  attachment_url?: string;
}) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await executeAction(
    `INSERT INTO consultation_messages (id, consultation_id, sender_id, content, message_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.consultation_id,
      data.sender_id,
      data.message,
      data.attachment_url || 'text',
      createdAt
    ]
  );
  return {
    id,
    consultation_id: data.consultation_id,
    sender_id: data.sender_id,
    sender_role: data.sender_role,
    message: data.message,
    attachment_url: data.attachment_url || null,
    created_at: createdAt
  };
}
