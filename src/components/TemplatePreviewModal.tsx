/**
 * Template Preview Modal
 * 
 * Shows example inputs, outputs, and use cases for workflow templates.
 * Helps users understand templates before creating workflows.
 * 
 * @module TemplatePreviewModal
 */

import React from 'react';
import { X, CheckCircle, Target, Zap } from 'lucide-react';
import { TemplateSample } from '../config/templateSamples';

interface TemplatePreviewModalProps {
  template: {
    name: string;
    description: string;
    category: string;
  };
  sample: TemplateSample;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate: () => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  sample,
  isOpen,
  onClose,
  onUseTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div>
            <h2 className="text-2xl font-bold">{template.name}</h2>
            <p className="text-primary-100 text-sm mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-primary-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Use Case */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Example Use Case</h3>
            </div>
            <p className="text-gray-700 bg-primary-50 p-4 rounded-lg border border-primary-200">
              {sample.useCase}
            </p>
          </div>

          {/* Sample Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📥 Sample Input</h3>
            <p className="text-sm text-gray-600 mb-2">{sample.sampleInput.description}</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm">
              <pre className="whitespace-pre-wrap text-gray-800">
                {JSON.stringify(sample.sampleInput.data, null, 2)}
              </pre>
            </div>
          </div>

          {/* Expected Output */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📤 Expected Output</h3>
            <p className="text-sm text-gray-600 mb-2">{sample.expectedOutput.description}</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <pre className="whitespace-pre-wrap text-gray-800 text-sm font-sans">
                {sample.expectedOutput.example}
              </pre>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Benefits</h3>
            </div>
            <ul className="space-y-2">
              {sample.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Best For */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ Best For</h3>
            <div className="flex flex-wrap gap-2">
              {sample.bestFor.map((use, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Close Preview
          </button>
          <button
            onClick={onUseTemplate}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <span>Use This Template</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
