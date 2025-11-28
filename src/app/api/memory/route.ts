/**
 * User Memory API
 * 
 * Endpoints for managing user insights/memory
 * 
 * GET - Retrieve memory stats and insights
 * DELETE - Clear user memory (GDPR/privacy compliance)
 * 
 * COMPLIANCE: See mind_gleam_global_compliance_blueprint.md Section 5
 * - Users have right to access their data
 * - Users have right to delete their data
 */

import { NextResponse } from 'next/server';
import { authenticateApiRoute, ErrorResponses } from '@/utils/supabase-server';
import { 
  getUserMemory, 
  clearUserMemory, 
  exportUserMemory,
  getMemoryStats 
} from '@/utils/userMemory';

export const dynamic = 'force-dynamic';

/**
 * GET /api/memory
 * Retrieve user's memory stats and optionally full insights
 */
export async function GET(request: Request) {
  try {
    const { response, session, supabase } = await authenticateApiRoute();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const includeInsights = searchParams.get('full') === 'true';

    const memory = await getUserMemory(supabase, session.user.id);
    const stats = getMemoryStats(memory);

    if (includeInsights && memory) {
      // Full export for data access requests
      const exported = await exportUserMemory(supabase, session.user.id);
      return NextResponse.json({
        success: true,
        ...stats,
        insights: exported?.insights || null,
        metadata: exported?.metadata || null
      });
    }

    // Stats only (default)
    return NextResponse.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching memory:', error);
    return ErrorResponses.serverError('Failed to fetch memory');
  }
}

/**
 * DELETE /api/memory
 * Clear user's memory (privacy/GDPR compliance)
 */
export async function DELETE() {
  try {
    const { response, session, supabase } = await authenticateApiRoute();
    if (response) return response;

    const success = await clearUserMemory(supabase, session.user.id);

    if (!success) {
      return ErrorResponses.serverError('Failed to clear memory');
    }

    return NextResponse.json({
      success: true,
      message: 'Your conversation memory has been cleared. I\'ll get to know you fresh in our future chats!'
    });
  } catch (error) {
    console.error('Error clearing memory:', error);
    return ErrorResponses.serverError('Failed to clear memory');
  }
}

