'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  minRequired?: number;
  placeholder?: string;
  description?: string;
}

export function TagInput({ label, tags, onChange, minRequired = 0, placeholder = 'Add tag...', description }: TagInputProps) {
  const [inputVal, setInputVal] = useState('');

  const addTag = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</label>
        {minRequired > 0 && (
          <span className={`text-xs ${tags.length >= minRequired ? 'text-emerald-600' : 'text-amber-600 font-semibold'}`}>
            {tags.length}/{minRequired} required
          </span>
        )}
      </div>
      {description && <p className="text-xs text-zinc-500">{description}</p>}
      <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md min-h-[44px]">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="inline-flex items-center gap-1">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-xs bg-transparent border-none outline-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 w-28"
            aria-label="Add new tag"
          />
          <button
            type="button"
            onClick={addTag}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Add tag"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}