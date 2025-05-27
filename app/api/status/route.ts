import { NextResponse } from 'next/server';

// This would ideally connect to your game state management
// For now, returning mock data that matches the expected format
export async function GET() {
  const mockState = {
    currentRound: 1,
    totalPool: 0,
    timeRemaining: 60,
    phase: 'active',
    participants: 0,
    recentWinners: []
  };

  return NextResponse.json(mockState);
} 