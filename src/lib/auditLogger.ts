/**
 * AUDIT LOGGING UTILITIES
 * 
 * PURPOSE: Centralized audit logging for all trust-critical actions
 * 
 * DESIGN PRINCIPLES:
 * - All mutations must be logged
 * - Logs are append-only and immutable
 * - Sensitive content is never stored
 * - Failures are logged but never crash user flows
 * 
 * COVERAGE:
 * - Authentication events
 * - Data mutations (create, update, delete)
 * - Subscription changes
 * - Access denials
 * 
 * @see supabase/migrations for audit_logs table schema
 * @see docs/SECURITY_MODEL.md for security requirements
 */

import { supabase } from "@/integrations/supabase/client";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Standardized action types for consistent logging
 * DO NOT use free-form strings - add to this enum
 */
export type AuditAction =
  // Authentication
  | "AUTH_LOGIN"
  | "AUTH_LOGOUT"
  | "AUTH_SIGNUP"
  | "AUTH_PASSWORD_RESET"
  | "AUTH_MFA_ENABLE"
  | "AUTH_MFA_DISABLE"
  // Child data
  | "CHILD_VIEW"
  | "CHILD_INSERT"
  | "CHILD_UPDATE"
  | "CHILD_DELETE"
  // Schedule data
  | "SCHEDULE_VIEW"
  | "SCHEDULE_INSERT"
  | "SCHEDULE_UPDATE"
  | "SCHEDULE_DELETE"
  | "SCHEDULE_REQUEST_CREATE"
  | "SCHEDULE_REQUEST_RESPOND"
  // Messages
  | "MESSAGE_SEND"
  | "MESSAGE_VIEW"
  | "MESSAGE_DELETE"
  | "THREAD_CREATE"
  | "THREAD_VIEW"
  // Expenses
  | "EXPENSE_INSERT"
  | "EXPENSE_UPDATE"
  | "EXPENSE_DELETE"
  | "EXPENSE_VIEW"
  | "REIMBURSEMENT_REQUEST"
  | "REIMBURSEMENT_RESPOND"
  // Documents
  | "DOCUMENT_UPLOAD"
  | "DOCUMENT_VIEW"
  | "DOCUMENT_DELETE"
  | "DOCUMENT_DOWNLOAD"
  // Exports
  | "DATA_EXPORT"
  | "COURT_EXPORT"
  | "PDF_EXPORT"
  // Family management
  | "INVITATION_SEND"
  | "INVITATION_ACCEPT"
  | "INVITATION_REVOKE"
  | "FAMILY_MEMBER_REMOVE"
  | "ROLE_CHANGE"
  // Subscription
  | "SUBSCRIPTION_START"
  | "SUBSCRIPTION_CANCEL"
  | "SUBSCRIPTION_UPGRADE"
  | "SUBSCRIPTION_DOWNGRADE"
  | "TRIAL_START"
  | "TRIAL_END"
  // Access control
  | "ACCESS_DENIED"
  | "PERMISSION_CHANGE"
  // Admin
  | "ADMIN_ACTION"
  // Generic
  | "CLEANUP_DELETE";

/**
 * Entity types that can be logged
 */
export type AuditEntityType =
  | "child"
  | "schedule"
  | "message"
  | "thread"
  | "expense"
  | "document"
  | "invitation"
  | "family_member"
  | "subscription"
  | "user_data"
  | "law_library_resource"
  | "activity"
  | "coloring_page"
  | "journal"
  | "gift_list"
  | "gift_item"
  | "photo";

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  childId?: string;
  metadata?: Record<string, unknown>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

// =============================================================================
// CORE LOGGING FUNCTION
// =============================================================================

/**
 * Log an audit event using the server-side SECURITY DEFINER function
 * 
 * WHY: Ensures actor identity cannot be spoofed (captured from auth.uid())
 * WHY: Captures role at time of action for court defensibility
 * 
 * @param entry - The audit log entry to record
 * @returns The log ID if successful, null on failure
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc("log_audit_event", {
      _action: entry.action,
      _entity_type: entry.entityType,
      _entity_id: entry.entityId || null,
      _child_id: entry.childId || null,
      _family_context: null,
      _metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : null,
      _before: entry.before ? JSON.parse(JSON.stringify(entry.before)) : null,
      _after: entry.after ? JSON.parse(JSON.stringify(entry.after)) : null,
    });

    if (error) {
      // Log error but don't crash user flow
      console.error("[AuditLogger] Failed to log event:", error.message);
      return null;
    }

    return data as string;
  } catch (err) {
    // Swallow errors - audit failures should never crash user flows
    console.error("[AuditLogger] Unexpected error:", err);
    return null;
  }
}

// =============================================================================
// CONVENIENCE LOGGING FUNCTIONS
// =============================================================================

/**
 * Log a child data view event
 * WHY: Track who accessed child information
 */
export async function logChildView(childId: string): Promise<void> {
  await logAuditEvent({
    action: "CHILD_VIEW",
    entityType: "child",
    entityId: childId,
    childId,
  });
}

/**
 * Log a child data mutation
 * WHY: Track all changes to child information
 */
export async function logChildMutation(
  action: "CHILD_INSERT" | "CHILD_UPDATE" | "CHILD_DELETE",
  childId: string,
  before?: Record<string, unknown>,
  after?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "child",
    entityId: childId,
    childId,
    before,
    after,
  });
}

/**
 * Log a schedule event
 * WHY: Track custody schedule access and changes
 */
export async function logScheduleEvent(
  action: AuditAction,
  scheduleId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "schedule",
    entityId: scheduleId,
    metadata,
  });
}

/**
 * Log a message event
 * WHY: Track message access (never content)
 */
export async function logMessageEvent(
  action: "MESSAGE_SEND" | "MESSAGE_VIEW" | "MESSAGE_DELETE",
  threadId: string,
  messageId?: string
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "message",
    entityId: messageId,
    metadata: { thread_id: threadId },
  });
}

/**
 * Log an expense event
 * WHY: Track financial data access and changes
 */
export async function logExpenseEvent(
  action: "EXPENSE_INSERT" | "EXPENSE_UPDATE" | "EXPENSE_DELETE" | "EXPENSE_VIEW",
  expenseId: string,
  childId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "expense",
    entityId: expenseId,
    childId,
    metadata,
  });
}

/**
 * Log a document event
 * WHY: Track document access for court records
 */
export async function logDocumentEvent(
  action: "DOCUMENT_UPLOAD" | "DOCUMENT_VIEW" | "DOCUMENT_DELETE" | "DOCUMENT_DOWNLOAD",
  documentId: string,
  childId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "document",
    entityId: documentId,
    childId,
    metadata,
  });
}

/**
 * Log a data export event
 * WHY: Track when data is exported (GDPR compliance, court records)
 */
export async function logDataExport(
  exportType: "DATA_EXPORT" | "COURT_EXPORT" | "PDF_EXPORT",
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action: exportType,
    entityType: "user_data",
    metadata,
  });
}

/**
 * Log an invitation event
 * WHY: Track family membership changes
 */
export async function logInvitationEvent(
  action: "INVITATION_SEND" | "INVITATION_ACCEPT" | "INVITATION_REVOKE",
  invitationId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "invitation",
    entityId: invitationId,
    metadata,
  });
}

/**
 * Log a subscription event
 * WHY: Track tier changes for access control auditing
 */
export async function logSubscriptionEvent(
  action: "SUBSCRIPTION_START" | "SUBSCRIPTION_CANCEL" | "SUBSCRIPTION_UPGRADE" | "SUBSCRIPTION_DOWNGRADE" | "TRIAL_START" | "TRIAL_END",
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    action,
    entityType: "subscription",
    metadata,
  });
}

/**
 * Log an access denial
 * WHY: Track attempted unauthorized access for security monitoring
 */
export async function logAccessDenied(
  attemptedRoute: string,
  reason: string
): Promise<void> {
  await logAuditEvent({
    action: "ACCESS_DENIED",
    entityType: "user_data",
    metadata: {
      attempted_route: attemptedRoute,
      denial_reason: reason,
      // Explicitly NOT logging any sensitive context
    },
  });
}

// =============================================================================
// BATCH LOGGING (for efficiency)
// =============================================================================

/**
 * Log multiple events in batch
 * WHY: Reduces database roundtrips for bulk operations
 * 
 * Note: Individual failures don't stop the batch
 */
export async function logAuditEventBatch(entries: AuditLogEntry[]): Promise<void> {
  // Process in parallel, don't wait for all to complete
  await Promise.allSettled(entries.map(entry => logAuditEvent(entry)));
}

// =============================================================================
// HELPER: Sanitize data for logging
// =============================================================================

/**
 * Remove sensitive fields before logging
 * WHY: Audit logs must never contain plaintext sensitive data
 */
export function sanitizeForAudit<T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: (keyof T)[] = []
): Partial<T> {
  const sanitized = { ...data };
  
  // Default sensitive fields
  const defaultSensitive = [
    "password",
    "token",
    "secret",
    "api_key",
    "content", // Message content
    "body",    // Email/message body
  ];
  
  [...defaultSensitive, ...sensitiveFields].forEach(field => {
    if (field in sanitized) {
      delete sanitized[field as keyof T];
    }
  });
  
  return sanitized;
}
