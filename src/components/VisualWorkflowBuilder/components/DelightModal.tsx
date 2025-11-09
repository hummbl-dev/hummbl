/**
 * Delight Modal Component for Visual Workflow Builder
 * 
 * Captures user delight feedback and experience metrics after workflow completion.
 * Implements UX feedback loop using P1 (Frame) and IN2 (Reverse assumptions).
 * 
 * @module DelightModal
 * @version 1.0.0
 * @see https://hummbl.io/docs/visual-workflow-builder
 */

import React, { useState } from 'react';

interface DelightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: DelightFeedback) => void;
  workflowName: string;
}

export interface DelightFeedback {
  score: number; // 1-5 scale
  easeSatisfaction: number; // 1-5 scale (TTFW - Time To First Win)
  visualSatisfaction: number; // 1-5 scale (visual adoption metric)
  comment?: string;
  willRecommend: boolean;
  timestamp: Date;
}

/**
 * Delight Modal for capturing user satisfaction metrics
 * Using P1 (Perspective - Frame): Frame feedback as delight, not just survey
 * Using IN2 (Inversion - Reverse): What would make this experience worse?
 */
export const DelightModal: React.FC<DelightModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workflowName,
}) => {
  const [score, setScore] = useState<number>(5);
  const [easeSatisfaction, setEaseSatisfaction] = useState<number>(5);
  const [visualSatisfaction, setVisualSatisfaction] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [willRecommend, setWillRecommend] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const feedback: DelightFeedback = {
      score,
      easeSatisfaction,
      visualSatisfaction,
      comment: comment.trim() || undefined,
      willRecommend,
      timestamp: new Date(),
    };

    onSubmit(feedback);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '560px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '8px',
              }}
            >
              🎉 Workflow Complete!
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Help us improve <strong>{workflowName}</strong>
            </p>
          </div>

          {/* Overall Delight Score */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
              }}
            >
              How delighted are you with this workflow?
            </label>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setScore(rating)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: score === rating ? '#3b82f6' : '#e5e7eb',
                    backgroundColor: score === rating ? '#eff6ff' : 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {rating === 1 && '😞'}
                  {rating === 2 && '😐'}
                  {rating === 3 && '🙂'}
                  {rating === 4 && '😊'}
                  {rating === 5 && '🤩'}
                </button>
              ))}
            </div>
          </div>

          {/* Ease of Use (TTFW metric) */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              How easy was it to get started? (Time to First Win)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={easeSatisfaction}
              onChange={(e) => setEaseSatisfaction(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px',
              }}
            >
              <span>Very difficult</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                {easeSatisfaction}/5
              </span>
              <span>Very easy</span>
            </div>
          </div>

          {/* Visual Appeal (visual adoption metric) */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              How intuitive was the visual workflow builder?
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={visualSatisfaction}
              onChange={(e) => setVisualSatisfaction(Number(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px',
              }}
            >
              <span>Confusing</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                {visualSatisfaction}/5
              </span>
              <span>Crystal clear</span>
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={willRecommend}
                onChange={(e) => setWillRecommend(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '12px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>
                I would recommend this workflow builder to others
              </span>
            </label>
          </div>

          {/* Optional Comment */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Any additional thoughts? (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What could we improve?"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
