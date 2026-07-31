import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectMember } from '@/features/projects/types/project';
import { CreateTaskPayload } from '@/features/tasks/types/task';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateTaskModalProps {
  members: ProjectMember[];
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  members,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('unassigned');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let formattedDueDate: string | null = null;
      if (dueDate) {
        formattedDueDate = new Date(dueDate).toISOString();
      }

      await onSubmit({
        title,
        description,
        priority,
        dueDate: formattedDueDate,
        assigneeId: assigneeId === 'unassigned' ? null : assigneeId,
      });
      onClose();
    } catch (err) {
      alert(t('task.create_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('task.create_title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">{t('task.label_title')}</label>
            <Input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('task.placeholder_title')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">{t('task.label_description')}</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('task.placeholder_description')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">{t('task.label_priority')}</label>
              <Select value={priority} onValueChange={(val) => setPriority(val as 'low' | 'medium' | 'high')}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('task.priority_low')}</SelectItem>
                  <SelectItem value="medium">{t('task.priority_medium')}</SelectItem>
                  <SelectItem value="high">{t('task.priority_high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">{t('task.label_due_date')}</label>
              <DatePicker
                value={dueDate}
                onChange={(date) => setDueDate(date)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">{t('task.label_assignee')}</label>
            <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">{t('task.unassigned')}</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.displayName} (@{m.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.submitting') : t('task.create_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
