import { AlertCircle, FileText, Flag, Folder, Target, Zap } from "lucide-react";

// ──── Priority Config ────
export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: '#EF4444', icon: <Flag size={12} /> },
  high:   { label: 'High', color: '#F97316', icon: <Flag size={12} /> },
  medium: { label: 'Medium', color: '#3B82F6', icon: <Flag size={12} /> },
  low:    { label: 'Low', color: '#6B7280', icon: <Flag size={12} /> },
} as const;

// ──── Type Config ────
export const TYPE_CONFIG = {
  task:      { label: 'Task', icon: <FileText size={12} /> },
  bug:       { label: 'Bug', icon: <AlertCircle size={12} /> },
  milestone: { label: 'Milestone', icon: <Target size={12} /> },
  epic:      { label: 'Epic', icon: <Zap size={12} /> },
  project:   { label: 'Project', icon: <Folder size={12} /> },
} as const;