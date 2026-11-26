import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CallScriptDrawer } from '@/components/outreach/CallScriptDrawer';
import { OutreachThread } from '@/types/outreach';

describe('CallScriptDrawer Component', () => {
  const mockThread: OutreachThread = {
    id: 'th-1',
    workspace_id: 'ws-1',
    raw_signal_id: null,
    source_channel: 'hackernews',
    external_id: 'hn-123',
    author: 'Rachel Green',
    title: 'Need AI technician dispatch',
    content: 'Looking for a reliable system to automate technician routing at Brightline HVAC',
    thread_url: 'https://news.ycombinator.com/item?id=123',
    match_score: 94,
    match_reason: 'High buying intent',
    stage: 'approved',
    approved_at: new Date().toISOString(),
    contacted_at: null,
    contact_method: null,
    author_phone: '+15551234567',
    author_company: 'Brightline HVAC',
    created_at: new Date().toISOString(),
  };

  it('renders Step 1: Orient by default and displays prospect name and company', () => {
    render(<CallScriptDrawer isOpen={true} onClose={vi.fn()} thread={mockThread} agencyName="Apex Flow" serviceName="AI Dispatch" onOutcomeLogged={vi.fn()} />);
    expect(screen.getByText(/1. Orient/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Rachel Green/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Brightline HVAC/)).toHaveLength(2);
  });

  it('allows jumping directly to Step 3: Objections non-linearly', () => {
    render(<CallScriptDrawer isOpen={true} onClose={vi.fn()} thread={mockThread} agencyName="Apex Flow" serviceName="AI Dispatch" onOutcomeLogged={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /3. Objections/i }));
    expect(screen.getByText(/Pricing Objection/i)).toBeInTheDocument();
  });

  it('expands objection accordion on tap', () => {
    render(<CallScriptDrawer isOpen={true} onClose={vi.fn()} thread={mockThread} agencyName="Apex Flow" serviceName="AI Dispatch" onOutcomeLogged={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /3. Objections/i }));
    const pricingBtn = screen.getByRole('button', { name: /Pricing Objection/i });
    fireEvent.click(pricingBtn);
    expect(screen.getByText(/performance milestones/i)).toBeInTheDocument();
  });
});