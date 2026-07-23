import { executeQuery, getMany, executeAction } from '../db/client';
import { sendEmail } from '../email/resend';
import { render } from '@react-email/render';
import * as React from 'react';

export type NotificationType = 'appointment' | 'consultation' | 'approval' | 'rejection' | 'system' | 'reminder' | 'message';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: number;
  action_url: string | null;
  created_at: string;
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
}) {
  const id = crypto.randomUUID();
  const sql = `
    INSERT INTO notifications (id, user_id, title, message, type, action_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  await executeAction(sql, [
    id,
    data.userId,
    data.title,
    data.message,
    data.type,
    data.actionUrl || null
  ]);
  
  return id;
}

export async function markAsRead(id: string, userId: string) {
  const sql = `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`;
  await executeAction(sql, [id, userId]);
}

export async function markAllAsRead(userId: string) {
  const sql = `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`;
  await executeAction(sql, [userId]);
}

export async function getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  const sql = `
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `;
  return getMany<Notification>(sql, [userId, limit]);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const sql = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`;
  const result = await getMany<{ count: number }>(sql, [userId]);
  return result[0]?.count || 0;
}

export async function sendEmailNotification(to: string, subject: string, template: React.ReactElement) {
  const html = await render(template);
  return sendEmail({ to, subject, html });
}

export async function sendNotificationAndEmail({
  userId,
  emailTo,
  emailSubject,
  title,
  message,
  type,
  actionUrl,
  emailTemplate
}: {
  userId: string;
  emailTo: string;
  emailSubject: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  emailTemplate: React.ReactElement;
}) {
  const notificationId = await createNotification({ userId, title, message, type, actionUrl });
  const emailResult = await sendEmailNotification(emailTo, emailSubject, emailTemplate);
  
  return { notificationId, emailResult };
}
