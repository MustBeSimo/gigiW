import { NextResponse } from 'next/server';
import { getSocialLinks } from '@/utils/socialLinks';

export async function GET() {
  try {
    const links = getSocialLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error in social links API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social links' },
      { status: 500 }
    );
  }
} 