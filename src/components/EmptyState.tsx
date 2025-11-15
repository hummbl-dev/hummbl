import React from 'react';
import { Inbox, Zap, Users, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}

// Preset empty states for common scenarios
export function EmptyWorkflows({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={Zap}
      title="No workflows yet"
      description="Create your first workflow to start automating tasks with AI agents. Workflows help you orchestrate complex multi-step processes."
      actionLabel="Create Workflow"
      onAction={onCreate}
    />
  );
}

export function EmptyAgents({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No agents configured"
      description="Agents are AI assistants that perform specific tasks in your workflows. Create your first agent to get started."
      actionLabel="Create Agent"
      onAction={onCreate}
    />
  );
}

export function EmptyTemplates() {
  return (
    <EmptyState
      icon={FileText}
      title="No templates available"
      description="Templates provide pre-configured workflows for common use cases. Check back later for new templates."
    />
  );
}

export function EmptyExecutions() {
  return (
    <EmptyState
      icon={Zap}
      title="No executions yet"
      description="When you run workflows, their execution history will appear here. Start by creating and running your first workflow."
    />
  );
}
