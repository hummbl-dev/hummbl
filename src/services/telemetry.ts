/**
 * Telemetry Service for Visual Workflow Builder
 * 
 * Tracks user engagement, workflow metrics, and delight scores.
 * Implements privacy-first analytics using P1 (Frame) and SY8 (Emergence).
 * 
 * @module telemetry
 * @version 1.0.0
 * @see https://hummbl.io/docs/telemetry
 */

import { track } from '@vercel/analytics';
import type { DelightFeedback } from '../components/VisualWorkflowBuilder/components/DelightModal';

/**
 * Telemetry Event Types
 * Using DE3 (Decomposition - Break down): Categorize events by domain
 */
export type TelemetryEvent =
  | 'workflow_created'
  | 'workflow_executed'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'agent_added'
  | 'task_added'
  | 'connection_created'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_abandoned'
  | 'delight_feedback_submitted'
  | 'template_used'
  | 'visual_builder_opened'
  | 'ttfw_achieved'; // Time To First Win

interface TelemetryEventData {
  event: TelemetryEvent;
  properties?: Record<string, string | number | boolean>;
  timestamp?: Date;
}

interface WorkflowMetrics {
  workflowId: string;
  taskCount: number;
  agentCount: number;
  executionTime?: number;
  success: boolean;
}

interface OnboardingMetrics {
  stepCompleted: number;
  totalSteps: number;
  timeSpent: number;
  abandoned: boolean;
}

/**
 * Telemetry Service Class
 * Using SY8 (Systems - Meta-systems): Aggregate metrics for system insights
 */
class TelemetryService {
  private sessionStartTime: Date = new Date();
  private ttfwAchieved: boolean = false;

  /**
   * Track a generic telemetry event
   * Using P1 (Perspective - Frame): Frame data collection as product improvement
   */
  track(eventData: TelemetryEventData): void {
    const { event, properties = {}, timestamp = new Date() } = eventData;

    // Send to Vercel Analytics
    track(event, {
      ...properties,
      timestamp: timestamp.toISOString(),
      sessionDuration: this.getSessionDuration(),
    });

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Telemetry]', event, properties);
    }
  }

  /**
   * Track workflow lifecycle events
   */
  trackWorkflowEvent(
    event: Extract<TelemetryEvent, 'workflow_created' | 'workflow_executed' | 'workflow_completed' | 'workflow_failed'>,
    metrics: WorkflowMetrics
  ): void {
    this.track({
      event,
      properties: {
        workflow_id: metrics.workflowId,
        task_count: metrics.taskCount,
        agent_count: metrics.agentCount,
        execution_time: metrics.executionTime || 0,
        success: metrics.success,
      },
    });

    // Track TTFW (Time To First Win) on first successful workflow
    if (event === 'workflow_completed' && metrics.success && !this.ttfwAchieved) {
      this.trackTTFW();
    }
  }

  /**
   * Track Time To First Win (TTFW)
   * Critical metric: How quickly users achieve first success
   */
  trackTTFW(): void {
    if (this.ttfwAchieved) return;

    const ttfw = this.getSessionDuration();
    this.ttfwAchieved = true;

    this.track({
      event: 'ttfw_achieved',
      properties: {
        time_to_first_win_seconds: ttfw,
        time_to_first_win_formatted: this.formatDuration(ttfw),
      },
    });
  }

  /**
   * Track onboarding progress
   */
  trackOnboarding(metrics: OnboardingMetrics): void {
    const event: TelemetryEvent = metrics.abandoned
      ? 'onboarding_abandoned'
      : metrics.stepCompleted === metrics.totalSteps
      ? 'onboarding_completed'
      : 'onboarding_started';

    this.track({
      event,
      properties: {
        step_completed: metrics.stepCompleted,
        total_steps: metrics.totalSteps,
        progress_percent: Math.round((metrics.stepCompleted / metrics.totalSteps) * 100),
        time_spent_seconds: metrics.timeSpent,
      },
    });
  }

  /**
   * Track delight feedback
   * Using IN2 (Inversion - Reverse): What creates vs. destroys delight?
   */
  trackDelightFeedback(feedback: DelightFeedback): void {
    const avgScore = (
      (feedback.score + feedback.easeSatisfaction + feedback.visualSatisfaction) / 3
    ).toFixed(1);

    this.track({
      event: 'delight_feedback_submitted',
      properties: {
        overall_score: feedback.score,
        ease_satisfaction: feedback.easeSatisfaction,
        visual_satisfaction: feedback.visualSatisfaction,
        average_score: Number(avgScore),
        will_recommend: feedback.willRecommend,
        has_comment: Boolean(feedback.comment),
      },
    });

    // Store aggregated metrics (in real app, this would go to analytics backend)
    this.updateDelightMetrics({
      score: Number(avgScore),
      visualSatisfaction: feedback.visualSatisfaction,
    });
  }

  /**
   * Track visual builder adoption
   */
  trackVisualBuilderUsage(action: 'opened' | 'agent_added' | 'task_added' | 'connection_created'): void {
    const eventMap: Record<typeof action, TelemetryEvent> = {
      opened: 'visual_builder_opened',
      agent_added: 'agent_added',
      task_added: 'task_added',
      connection_created: 'connection_created',
    };

    this.track({
      event: eventMap[action],
      properties: {
        session_duration: this.getSessionDuration(),
      },
    });
  }

  /**
   * Track template usage
   */
  trackTemplateUsage(templateId: string, templateName: string): void {
    this.track({
      event: 'template_used',
      properties: {
        template_id: templateId,
        template_name: templateName,
      },
    });
  }

  /**
   * Get session duration in seconds
   */
  private getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000);
  }

  /**
   * Format duration as MM:SS
   */
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Update aggregated delight metrics
   * In production, this would sync to analytics backend
   */
  private updateDelightMetrics(data: { score: number; visualSatisfaction: number }): void {
    try {
      const stored = localStorage.getItem('hummbl_delight_metrics');
      const metrics = stored ? JSON.parse(stored) : { scores: [], visualScores: [], count: 0 };

      metrics.scores.push(data.score);
      metrics.visualScores.push(data.visualSatisfaction);
      metrics.count++;

      // Calculate running averages
      metrics.avgDelightScore = (
        metrics.scores.reduce((a: number, b: number) => a + b, 0) / metrics.scores.length
      ).toFixed(1);

      metrics.avgVisualSatisfaction = (
        metrics.visualScores.reduce((a: number, b: number) => a + b, 0) / metrics.visualScores.length
      ).toFixed(1);

      metrics.visualAdoptionRate = ((metrics.visualScores.filter((s: number) => s >= 4).length / metrics.visualScores.length) * 100).toFixed(0);

      localStorage.setItem('hummbl_delight_metrics', JSON.stringify(metrics));
    } catch (error) {
      // Silently fail if localStorage unavailable
      if (import.meta.env.DEV) {
        console.warn('[Telemetry] Failed to store metrics:', error);
      }
    }
  }

  /**
   * Get current aggregated metrics
   */
  getAggregatedMetrics(): {
    avgDelightScore: number;
    visualAdoptionRate: number;
    ttfw: string;
  } {
    try {
      const stored = localStorage.getItem('hummbl_delight_metrics');
      const metrics = stored ? JSON.parse(stored) : null;

      return {
        avgDelightScore: metrics?.avgDelightScore ? Number(metrics.avgDelightScore) : 0,
        visualAdoptionRate: metrics?.visualAdoptionRate ? Number(metrics.visualAdoptionRate) : 0,
        ttfw: this.ttfwAchieved ? this.formatDuration(this.getSessionDuration()) : '0:00',
      };
    } catch {
      return {
        avgDelightScore: 0,
        visualAdoptionRate: 0,
        ttfw: '0:00',
      };
    }
  }
}

// Singleton instance
export const telemetry = new TelemetryService();

// Named exports for convenience
export const trackWorkflow = telemetry.trackWorkflowEvent.bind(telemetry);
export const trackOnboarding = telemetry.trackOnboarding.bind(telemetry);
export const trackDelight = telemetry.trackDelightFeedback.bind(telemetry);
export const trackVisualBuilder = telemetry.trackVisualBuilderUsage.bind(telemetry);
export const trackTemplate = telemetry.trackTemplateUsage.bind(telemetry);

/**
 * Error Report Interface
 */
export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  userId?: string;
  url?: string;
  userAgent?: string;
}

/**
 * Track error event
 */
export function trackError(error: Error | ErrorReport, context?: Record<string, unknown>): void {
  if (error instanceof Error) {
    track('error', {
      message: error.message,
      stack: error.stack || '',
      severity: 'medium' as const,
      ...(context as Record<string, string | number | boolean>),
    });
  } else {
    track('error', {
      message: error.message,
      stack: error.stack || '',
      componentStack: error.componentStack || '',
      severity: error.severity,
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      ...(error.context as Record<string, string | number | boolean>),
      ...(context as Record<string, string | number | boolean>),
    });
  }
}
