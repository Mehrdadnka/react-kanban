// src/features/TaskSidebars/create/hooks/useAttachments.ts
import { useCallback, useRef } from 'react';
import { createAttachmentFromFile, getFilesFromDragEvent, getFilesFromInputEvent } from '@/features/TaskSidebars/utils';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
}

interface UseAttachmentsProps {
  attachments: Attachment[];
  onUpdate: (attachments: Attachment[]) => void;
  disabled?: boolean;
}

export const useAttachments = ({ attachments, onUpdate, disabled = false }: UseAttachmentsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled) return;
    const newAttachments = await Promise.all(files.map(createAttachmentFromFile));
    onUpdate([...attachments, ...newAttachments]);
  }, [attachments, onUpdate, disabled]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(getFilesFromInputEvent(event));
    event.target.value = '';
  }, [handleFiles]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    handleFiles(getFilesFromDragEvent(event));
  }, [handleFiles]);

  const handleRemove = useCallback((attachmentId: string) => {
    if (disabled) return;
    onUpdate(attachments.filter(a => a.id !== attachmentId));
  }, [attachments, onUpdate, disabled]);

  return { fileInputRef, handleClick, handleFileSelect, handleDrop, handleRemove };
};