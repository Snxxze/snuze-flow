import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { subtaskService } from '@/features/subtasks/services/subtaskService';
import { Subtask } from '@/features/subtasks/types/subtask';
import { Task } from '@/features/tasks/types/task';
import { Plus, CheckSquare, Square, Trash2, Calendar, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onSubtasksUpdated?: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onSubtasksUpdated,
}) => {
  const { t, i18n } = useTranslation();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubtasks = async () => {
    try {
      const data = await subtaskService.listSubtasks(task.id);
      setSubtasks(data);
    } catch (err) {
      console.error('Failed to load subtasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, [task.id]);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await subtaskService.createSubtask(task.id, { title: newSubtaskTitle });
      setNewSubtaskTitle('');
      await fetchSubtasks();
      if (onSubtasksUpdated) onSubtasksUpdated();
    } catch (err) {
      alert(t('task.detail_subtask_add_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    try {
      await subtaskService.toggleSubtaskStatus(subtaskId, { isCompleted: !currentCompleted });
      await fetchSubtasks();
      if (onSubtasksUpdated) onSubtasksUpdated();
    } catch (err) {
      console.error('Failed to toggle subtask status:', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await subtaskService.deleteSubtask(subtaskId);
      await fetchSubtasks();
      if (onSubtasksUpdated) onSubtasksUpdated();
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo':
        return t('project.stat_todo');
      case 'in_progress':
        return t('project.stat_in_progress');
      case 'done':
        return t('project.stat_completed');
      default:
        return status.toUpperCase();
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              task.priority === 'high' ? 'bg-status-danger/10 text-status-danger' :
              task.priority === 'medium' ? 'bg-status-warning/10 text-status-warning' :
              'bg-charcoal/10 text-charcoal-subtle'
            }`}>
              {task.priority === 'high' ? t('task.priority_high') :
               task.priority === 'medium' ? t('task.priority_medium') :
               t('task.priority_low')}
            </span>
            <span className="text-xs text-charcoal-subtle">
              {t('task.detail_status')} <span className="font-semibold text-charcoal">{getStatusText(task.status)}</span>
            </span>
          </div>
          <DialogTitle className="mt-2 text-xl font-bold">{task.title}</DialogTitle>
        </DialogHeader>

        {/* Section 2: Task Metadata */}
        <div className="grid gap-3 sm:grid-cols-2 rounded-md bg-canvas p-3 border border-surface-border text-xs">
          <div className="flex items-center space-x-2 text-charcoal-subtle">
            <User className="h-4 w-4 text-ocean" />
            <span>{t('task.label_assignee')}: <strong className="text-charcoal">{task.assignee?.displayName || t('task.unassigned')}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-charcoal-subtle">
            <Calendar className="h-4 w-4 text-ocean" />
            <span>{t('task.label_due_date')}: <strong className="text-charcoal">{task.dueDate ? new Date(task.dueDate).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US') : t('common.none')}</strong></span>
          </div>
        </div>

        {task.description && (
          <div>
            <h4 className="text-xs font-semibold text-charcoal mb-1">{t('task.label_description')}</h4>
            <p className="text-xs text-charcoal-subtle leading-relaxed bg-canvas p-3 rounded-md border border-surface-border">
              {task.description}
            </p>
          </div>
        )}

        {/* Section 3: Subtasks Checklist & Progress Tracker */}
        <div className="border-t border-surface-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-charcoal flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-ocean" />
              <span>{t('task.detail_subtasks_title')}</span>
            </h3>
            <span className="text-xs font-semibold text-charcoal-subtle">
              {completedCount} / {subtasks.length} ({progressPercent})%
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-canvas border border-surface-border overflow-hidden">
            <div
              className="h-full bg-status-done transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Subtask Input Form */}
          <form onSubmit={handleAddSubtask} className="mt-4 flex items-center space-x-2">
            <Input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder={t('task.detail_subtask_placeholder')}
              className="flex-1 text-xs"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !newSubtaskTitle.trim()}
              className="gap-1"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('task.detail_subtask_add_btn')}</span>
            </Button>
          </form>

          {/* Subtasks List */}
          <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-center text-xs text-charcoal-subtle py-4">{t('task.detail_subtask_loading')}</div>
            ) : subtasks.length === 0 ? (
              <div className="text-center text-xs text-charcoal-subtle py-4 border border-dashed border-surface-border rounded-md">
                {t('task.detail_subtask_empty')}
              </div>
            ) : (
              subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-md border border-surface-border bg-canvas px-3 py-2 text-xs transition-colors hover:bg-surface group"
                >
                  <button
                    onClick={() => handleToggleSubtask(sub.id, sub.isCompleted)}
                    className="flex items-center space-x-2.5 flex-1 text-left"
                  >
                    {sub.isCompleted ? (
                      <CheckSquare className="h-4 w-4 text-status-done shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-charcoal-subtle shrink-0" />
                    )}
                    <span className={sub.isCompleted ? 'line-through text-charcoal-subtle' : 'text-charcoal font-medium'}>
                      {sub.title}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-subtle hover:text-status-danger transition-opacity"
                    title={t('common.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="secondary"
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
