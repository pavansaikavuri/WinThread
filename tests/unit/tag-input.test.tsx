import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagInput } from '@/components/setup/TagInput';

describe('TagInput', () => {
  it('renders tags and permits adding a new tag', () => {
    const onChange = vi.fn();
    render(<TagInput tags={['AI Automation', 'Lead Gen']} onChange={onChange} label="Services" />);

    expect(screen.getByText('AI Automation')).toBeInTheDocument();
    expect(screen.getByText('Lead Gen')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Add/i);
    fireEvent.change(input, { target: { value: 'SEO' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['AI Automation', 'Lead Gen', 'SEO']);
  });
});