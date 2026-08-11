import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, X, Mail, Inbox } from 'lucide-react';
import { ProjectInvitation } from '@/features/projects/types/project';
import { projectService } from '@/features/projects/services/projectService';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface NotificationCenterProps {
  invitations?: ProjectInvitation[];
  onAcceptInvitation?: (id: string) => Promise<void>;
  onRejectInvitation?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

const STORAGE_KEY = 'snuzeflow_notifications_last_read';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  invitations: propInvitations,
  onAcceptInvitation,
  onRejectInvitation,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation();
  const [internalInvitations, setInternalInvitations] = useState<ProjectInvitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lastReadTime, setLastReadTime] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const activeInvitations = propInvitations ?? internalInvitations;

  // Internal fetch if props not provided
  const fetchInvitations = async () => {
    try {
      const data = await projectService.listPendingInvitations();
      setInternalInvitations(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (!propInvitations) {
      fetchInvitations();
    }
  }, [propInvitations]);

  // Calculate unread count (invitations created after lastReadTime)
  const unreadCount = activeInvitations.filter(
    (inv) => new Date(inv.createdAt).getTime() > lastReadTime
  ).length;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Mark as read when opening notification center
      const now = Date.now();
      setLastReadTime(now);
      localStorage.setItem(STORAGE_KEY, now.toString());
    }
  };

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      if (onAcceptInvitation) {
        await onAcceptInvitation(id);
      } else {
        await projectService.acceptInvitation(id);
        await fetchInvitations();
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to accept invitation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      if (onRejectInvitation) {
        await onRejectInvitation(id);
      } else {
        await projectService.rejectInvitation(id);
        await fetchInvitations();
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to reject invitation:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(
        i18n.language === 'th' ? 'th-TH' : 'en-US',
        { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('notifications.bell_aria_label', 'การแจ้งเตือน')}
          className="relative p-1.5 rounded text-charcoal-subtle hover:text-charcoal hover:bg-surface-border/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ocean/40"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-150">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 border border-surface-border bg-canvas shadow-xl rounded-lg overflow-hidden"
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3 bg-surface">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-charcoal uppercase tracking-wider">
              {t('notifications.title', 'การแจ้งเตือน')}
            </h3>
            {activeInvitations.length > 0 && (
              <span className="rounded bg-ocean/10 px-1.5 py-0.5 text-[10px] font-bold text-ocean">
                {activeInvitations.length}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => handleOpenChange(true)}
              className="text-[11px] font-medium text-ocean hover:underline"
            >
              {t('notifications.mark_read', 'ทำเป็นอ่านแล้ว')}
            </button>
          )}
        </div>

        {/* Panel Body: Active Pending Invitations */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-surface-border/60">
          {activeInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-surface-border text-charcoal-subtle/50 mb-2">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-charcoal-subtle">
                {t('notifications.empty_title', 'ไม่มีการแจ้งเตือนใหม่')}
              </p>
              <p className="text-[11px] text-charcoal-subtle/70 mt-0.5">
                {t('notifications.empty_desc', 'คำเชิญและข้อความแจ้งเตือนทั้งหมดของคุณจะปรากฏที่นี่')}
              </p>
            </div>
          ) : (
            activeInvitations.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 hover:bg-surface/50 transition-colors flex flex-col gap-2.5"
              >
                {/* Item Content Header */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-ocean/10 text-ocean mt-0.5">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-charcoal leading-tight">
                      {t('project.banner_invite_title', 'คำเชิญเข้าร่วมโปรเจกต์')}{' '}
                      <span className="text-ocean font-bold">{inv.projectName}</span>
                    </p>
                    <p className="text-[11px] text-charcoal-subtle mt-0.5 truncate">
                      {t('project.banner_invited_by', { name: inv.invitedBy })}
                    </p>
                    <p className="text-[10px] font-data text-charcoal-subtle/60 mt-1">
                      {formatDate(inv.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Direct Action Buttons (Accept / Reject) */}
                <div className="flex items-center gap-2 pl-11">
                  <Button
                    size="xs"
                    disabled={processingId === inv.id}
                    onClick={() => handleAccept(inv.id)}
                    className="bg-status-done hover:bg-status-done/90 text-white font-medium text-[11px] h-7 gap-1 px-3 shadow-xs"
                  >
                    <Check className="h-3 w-3" />
                    <span>{t('project.banner_accept', 'ตอบรับ')}</span>
                  </Button>

                  <Button
                    size="xs"
                    variant="outline"
                    disabled={processingId === inv.id}
                    onClick={() => handleReject(inv.id)}
                    className="text-charcoal-subtle hover:text-status-danger hover:bg-status-danger/10 border-surface-border text-[11px] h-7 gap-1 px-2.5"
                  >
                    <X className="h-3 w-3" />
                    <span>{t('project.banner_reject', 'ปฏิเสธ')}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
