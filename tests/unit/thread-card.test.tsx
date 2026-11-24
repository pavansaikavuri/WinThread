import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThreadCard } from '@/components/threads/ThreadCard';

describe('ThreadCard Component', () => {
  const mockThread = {
    id: 't-1',
    source_channel: 'hackernews',
    author: 'startup_sam',
    title: 'Looking for Zapier + AI agency for client booking',
    content: 'We need automated follow-ups for our sales team.',
    thread_url: 'https://news.ycombinator.com/item?id=123',
    match_score: 94,
    match_reason: 'Prospect has acute pain with dropped leads and asks for automation agency.',
    status: 'new',
  };

  it('renders match score, source badge, author and action buttons', () => {
    render(
      <ThreadCard
        thread={mockThread as any}
        onApprove={vi.fn()}
        onDismiss={vi.fn()}
        onGenerateQuote={vi.fn()}
      />
    );
    expect(screen.getByText(/94% Match/i)).toBeInTheDocument();
    expect(screen.getByText(/startup_sam/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy reply/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate quote/i })).toBeInTheDocument();
  });
});
