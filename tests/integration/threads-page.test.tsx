import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadsPage from '@/app/threads/page';

describe('/threads Page', () => {
  it('renders page title and empty or populated feed state', () => {
    render(<ThreadsPage />);
    expect(screen.getByText(/ranked signal feed/i)).toBeInTheDocument();
  });
});
