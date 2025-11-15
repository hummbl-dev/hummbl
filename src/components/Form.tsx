import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  success,
  hint,
  required,
  children,
}: FormFieldProps) {
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <div className="space-y-1">
      <label className="label">
        {label}
        {required && <span className="text-gray-900 dark:text-gray-200 ml-1">*</span>}
      </label>
      <div className="relative">
        {children}
        {hasSuccess && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle className="h-5 w-5 text-gray-900 dark:text-gray-200" />
          </div>
        )}
      </div>
      {hint && !hasError && !hasSuccess && (
        <p className="text-xs text-gray-800 dark:text-gray-200 flex items-start gap-1">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </p>
      )}
      {hasError && (
        <p className="text-xs text-black dark:text-white dark:text-gray-200 flex items-start gap-1 animate-fade-in">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {hasSuccess && (
        <p className="text-xs text-black dark:text-white dark:text-gray-200 flex items-start gap-1 animate-fade-in">
          <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export function Input({ error, success, className = '', ...props }: InputProps) {
  const baseClasses = 'input-field';
  const errorClasses = error ? 'border-red-300 dark:border-red-700 focus:ring-red-500' : '';
  const successClasses = success ? 'border-green-300 dark:border-green-700 focus:ring-green-500' : '';
  
  return (
    <input
      className={`${baseClasses} ${errorClasses} ${successClasses} ${className}`}
      {...props}
    />
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
}

export function TextArea({ error, success, className = '', ...props }: TextAreaProps) {
  const baseClasses = 'input-field';
  const errorClasses = error ? 'border-red-300 dark:border-red-700 focus:ring-red-500' : '';
  const successClasses = success ? 'border-green-300 dark:border-green-700 focus:ring-green-500' : '';
  
  return (
    <textarea
      className={`${baseClasses} ${errorClasses} ${successClasses} ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  success?: boolean;
}

export function Select({ error, success, className = '', children, ...props }: SelectProps) {
  const baseClasses = 'input-field';
  const errorClasses = error ? 'border-red-300 dark:border-red-700 focus:ring-red-500' : '';
  const successClasses = success ? 'border-green-300 dark:border-green-700 focus:ring-green-500' : '';
  
  return (
    <select
      className={`${baseClasses} ${errorClasses} ${successClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
