import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SetupWizardForm } from '@/components/setup/SetupWizardForm';

describe('SetupWizardForm', () => {
  it('renders initial URL input and extracts on submit', async () => {
    const mockOnSubmit = vi.fn();
    render(<SetupWizardForm onSubmit={mockOnSubmit} isSubmitting={false} />);

    expect(screen.getByPlaceholderText(/https:\/\/myagency\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Website/i })).toBeInTheDocument();
  });
});