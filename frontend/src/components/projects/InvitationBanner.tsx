import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectInvitation } from '@/features/projects/types/project';
import { Check, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvitationBannerProps {
  invitations: ProjectInvitation[];
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const InvitationBanner: React.FC<InvitationBannerProps> = ({
  invitations,
  onAccept,
  onReject,
}) => {
  const { t } = useTranslation();
  if (invitations.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between rounded border border-status-warning/30 bg-status-warning/5 p-4 shadow-sm"
        >
          {/* Section 1: Invitation Details & Icon */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-status-warning/20 text-status-warning">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-charcoal">
                {t('project.banner_invite_title')} <span className="text-ocean">{inv.projectName}</span>
              </div>
              <div className="text-xs text-charcoal-subtle">
                {t('project.banner_invited_by', { name: inv.invitedBy })}
              </div>
            </div>
          </div>

          {/* Section 2: Action Buttons (Accept / Decline) */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onAccept(inv.id)}
              className="bg-status-done hover:bg-status-done/95 gap-1 shadow-sm"
              size="sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{t('project.banner_accept')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onReject(inv.id)}
              className="gap-1"
              size="sm"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t('project.banner_reject')}</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
