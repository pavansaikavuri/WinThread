import { z } from 'zod';

export const setupFormSchema = z.object({
  agencyUrl: z.string().url('Please enter a valid website URL (e.g. https://agency.com)'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
  services: z.array(z.string().min(1)).min(1, 'Add at least one service offered'),
  buyerTitles: z.array(z.string().min(1)).min(1, 'Add at least one buyer title'),
  painPoints: z.array(z.string().min(1)).min(1, 'Add at least one pain point'),
  buyingSignals: z.array(z.string().min(1)).min(1, 'Add at least one buying signal'),
  negativeKeywords: z.array(z.string().min(1)).min(3, 'At least 3 negative keywords are required to prevent noisy signals'),
});

export type SetupFormData = z.infer<typeof setupFormSchema>;