import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, User, Globe, Mail } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const changeLanguage = (lang: 'th' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('snuzeflow_lang', lang);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-5 border-b border-surface-border">
          <DialogTitle className="text-lg font-bold text-charcoal flex items-center space-x-2">
            <Settings className="h-5 w-5 text-ocean" />
            <span>{t('layout.logo_text')} {t('layout.settings')}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex h-[320px] bg-canvas/30">
          {/* Left Navigation Tabs Sidebar */}
          <div className="w-1/3 border-r border-surface-border bg-canvas p-4 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center space-x-2 w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'general'
                  ? 'bg-surface-border/60 text-charcoal'
                  : 'text-charcoal-subtle hover:bg-surface-border/30 hover:text-charcoal'
              }`}
            >
              <Globe className="h-4 w-4 text-ocean" />
              <span>{i18n.language === 'th' ? 'ทั่วไป' : 'General'}</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center space-x-2 w-full px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'account'
                  ? 'bg-surface-border/60 text-charcoal'
                  : 'text-charcoal-subtle hover:bg-surface-border/30 hover:text-charcoal'
              }`}
            >
              <User className="h-4 w-4 text-ocean" />
              <span>{i18n.language === 'th' ? 'บัญชีผู้ใช้' : 'Account'}</span>
            </button>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 p-6 bg-surface overflow-y-auto">
            {activeTab === 'general' ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                    {i18n.language === 'th' ? 'ภาษาของระบบ (Language)' : 'System Language'}
                  </h4>
                  <p className="text-[11px] text-charcoal-subtle mb-3">
                    {i18n.language === 'th' ? 'เลือกภาษาเริ่มต้นสำหรับแสดงผลส่วนต่อประสานทั้งหมด' : 'Select your preferred interface language.'}
                  </p>

                  {/* Segmented Pill Selector */}
                  <div className="flex rounded-md bg-canvas border border-surface-border p-1 w-64 shadow-2xs">
                    <button
                      onClick={() => changeLanguage('th')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-150 ${
                        i18n.language === 'th'
                          ? 'bg-surface border border-surface-border text-ocean shadow-2xs'
                          : 'text-charcoal-subtle hover:text-charcoal'
                      }`}
                    >
                      {t('layout.lang_th')}
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-150 ${
                        i18n.language === 'en'
                          ? 'bg-surface border border-surface-border text-ocean shadow-2xs'
                          : 'text-charcoal-subtle hover:text-charcoal'
                      }`}
                    >
                      {t('layout.lang_en')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
                    {i18n.language === 'th' ? 'ข้อมูลโปรไฟล์ผู้ใช้งาน' : 'User Profile Info'}
                  </h4>

                  <div className="space-y-3">
                    {/* Display Name Card */}
                    <div className="flex items-center space-x-3 rounded-md border border-surface-border bg-canvas p-3 text-xs">
                      <User className="h-4 w-4 text-charcoal-subtle shrink-0" />
                      <div>
                        <div className="text-[10px] text-charcoal-subtle font-semibold">Display Name</div>
                        <div className="text-charcoal font-bold mt-0.5">{user?.displayName}</div>
                      </div>
                    </div>

                    {/* Username Card */}
                    <div className="flex items-center space-x-3 rounded-md border border-surface-border bg-canvas p-3 text-xs">
                      <User className="h-4 w-4 text-charcoal-subtle shrink-0" />
                      <div>
                        <div className="text-[10px] text-charcoal-subtle font-semibold">Username</div>
                        <div className="text-charcoal font-bold mt-0.5">@{user?.username}</div>
                      </div>
                    </div>

                    {/* Email Card */}
                    <div className="flex items-center space-x-3 rounded-md border border-surface-border bg-canvas p-3 text-xs">
                      <Mail className="h-4 w-4 text-charcoal-subtle shrink-0" />
                      <div>
                        <div className="text-[10px] text-charcoal-subtle font-semibold">Email Address</div>
                        <div className="text-charcoal font-bold mt-0.5">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-4 border-t border-surface-border bg-canvas/30">
          <Button onClick={onClose} variant="secondary" className="text-xs h-8">
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
