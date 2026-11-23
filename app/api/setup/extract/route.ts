import { NextResponse } from 'next/server';
import { extractAgencyTaxonomy } from '@/lib/scraper/extract';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
    }
    const result = await extractAgencyTaxonomy(url);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}