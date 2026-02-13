import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface ValidatedInputProps {
    label: string;
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    error?: string;
    onChange: (value: string) => void;
    onValidate: (value: string) => void;
    required?: boolean;
    inputMode?: 'text' | 'numeric' | 'email' | 'tel';
    autoComplete?: string;
    className?: string;
}

/**
 * Componente de input con validación visual en tiempo real
 * - Checkmark verde cuando el campo es válido
 * - X roja con tooltip cuando hay error
 * - Feedback inmediato para mejor UX
 */
const ValidatedInput: React.FC<ValidatedInputProps> = ({
    label,
    icon,
    type,
    placeholder,
    value,
    error,
    onChange,
    onValidate,
    required = false,
    inputMode,
    autoComplete,
    className = ''
}) => {
    const isValid = !error && value.length > 0;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label con ícono */}
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                {icon}
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            {/* Input con estado visual */}
            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        onValidate(e.target.value);
                    }}
                    inputMode={inputMode}
                    autoComplete={autoComplete}
                    className={cn(
                        "w-full px-6 py-4 pr-12 rounded-2xl border-2 transition-all outline-none font-medium",
                        "focus:ring-4 focus:ring-emerald-100",
                        error
                            ? "border-red-300 bg-red-50/30 focus:border-red-400 text-red-900"
                            : isValid
                                ? "border-emerald-300 bg-emerald-50/30 focus:border-emerald-400"
                                : "border-gray-200 bg-gray-50 focus:border-emerald-300"
                    )}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${label}-error` : undefined}
                />

                {/* Ícono de estado (checkmark o error) */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {error && (
                        <XCircle className="text-red-500 animate-pulse" size={20} />
                    )}
                    {isValid && (
                        <CheckCircle2 className="text-emerald-500 animate-scale-in" size={20} />
                    )}
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <p
                    id={`${label}-error`}
                    className="text-xs text-red-600 flex items-center gap-1 animate-slide-down font-medium"
                >
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    );
};

export default ValidatedInput;
