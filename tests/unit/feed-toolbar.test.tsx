import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedToolbar } from '@/components/threads/FeedToolbar';

describe('FeedToolbar Component', () => {
  it('renders search input, channel pills with counts, and scan button', () => {
    const mockScan = vi.fn();
    render(
      <FeedToolbar
        activeChannel="all"
        onSelectChannel={vi.fn()}
        onlyHot={false}
        onToggleHot={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        onScanNow={mockScan}
        isScanning={false}
        counts={{ all: 18, hackernews: 6, reddit: 8, bluesky: 4 }}
      />
    );

    expect(screen.getByPlaceholderText(/search leads/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all \(18\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /scan channels now/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /scan channels now/i }));
    expect(mockScan).toHaveBeenCalled();
  });
});
