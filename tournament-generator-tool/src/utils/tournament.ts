import { Player, Match, Tournament } from '../types';

let idCounter = 0;
function generateId(): string {
  return `id_${Date.now()}_${idCounter++}`;
}

export function createPlayer(name: string, seed: number): Player {
  return { id: generateId(), name, seed };
}

export function generateBracket(players: Player[], tournamentName: string): Tournament {
  const n = players.length;
  const rounds = Math.ceil(Math.log2(n));
  const totalSlots = Math.pow(2, rounds);
  // Seed players
  const seededPlayers = [...players].sort((a, b) => a.seed - b.seed);

  // Create seeding order for bracket (standard tournament seeding)
  const seedOrder = getSeedOrder(totalSlots);

  // Place players into slots based on seed order
  const slots: (Player | null)[] = new Array(totalSlots).fill(null);
  for (let i = 0; i < seededPlayers.length; i++) {
    slots[seedOrder[i]] = seededPlayers[i];
  }

  // Generate all matches
  const matches: Match[] = [];
  const matchesByRound: Map<number, Match[]> = new Map();

  // Create matches for each round
  for (let round = 1; round <= rounds; round++) {
    const matchCount = totalSlots / Math.pow(2, round);
    const roundMatches: Match[] = [];
    for (let pos = 0; pos < matchCount; pos++) {
      const match: Match = {
        id: generateId(),
        round,
        position: pos,
        player1: null,
        player2: null,
        winner: null,
        nextMatchId: null,
        nextSlot: null,
      };
      roundMatches.push(match);
      matches.push(match);
    }
    matchesByRound.set(round, roundMatches);
  }

  // Link matches to next round
  for (let round = 1; round < rounds; round++) {
    const currentRoundMatches = matchesByRound.get(round)!;
    const nextRoundMatches = matchesByRound.get(round + 1)!;
    for (let i = 0; i < currentRoundMatches.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      const slot = i % 2 === 0 ? 'player1' : 'player2';
      currentRoundMatches[i].nextMatchId = nextRoundMatches[nextMatchIndex].id;
      currentRoundMatches[i].nextSlot = slot;
    }
  }

  // Fill first round with players
  const firstRoundMatches = matchesByRound.get(1)!;
  for (let i = 0; i < firstRoundMatches.length; i++) {
    firstRoundMatches[i].player1 = slots[i * 2];
    firstRoundMatches[i].player2 = slots[i * 2 + 1];

    // Handle byes
    if (firstRoundMatches[i].player1 && !firstRoundMatches[i].player2) {
      firstRoundMatches[i].winner = firstRoundMatches[i].player1;
      advanceWinner(firstRoundMatches[i], matches);
    } else if (!firstRoundMatches[i].player1 && firstRoundMatches[i].player2) {
      firstRoundMatches[i].winner = firstRoundMatches[i].player2;
      advanceWinner(firstRoundMatches[i], matches);
    }
  }

  return {
    id: generateId(),
    name: tournamentName,
    players: seededPlayers,
    matches,
    rounds,
    champion: null,
    status: 'in-progress',
  };
}

function advanceWinner(match: Match, allMatches: Match[]) {
  if (match.nextMatchId && match.winner) {
    const nextMatch = allMatches.find(m => m.id === match.nextMatchId);
    if (nextMatch && match.nextSlot) {
      nextMatch[match.nextSlot] = match.winner;

      // Auto-advance if next match has a bye too
      if (nextMatch.player1 && !nextMatch.player2) {
        nextMatch.winner = nextMatch.player1;
        advanceWinner(nextMatch, allMatches);
      } else if (!nextMatch.player1 && nextMatch.player2) {
        nextMatch.winner = nextMatch.player2;
        advanceWinner(nextMatch, allMatches);
      }
    }
  }
}

export function setMatchWinner(tournament: Tournament, matchId: string, winner: Player): Tournament {
  const newMatches = tournament.matches.map(m => ({ ...m }));
  const match = newMatches.find(m => m.id === matchId);
  if (!match) return tournament;

  match.winner = winner;

  // Advance winner to next match
  if (match.nextMatchId) {
    const nextMatch = newMatches.find(m => m.id === match.nextMatchId);
    if (nextMatch && match.nextSlot) {
      nextMatch[match.nextSlot] = winner;
    }
  }

  // Check if this is the final match
  const isChampion = !match.nextMatchId;

  return {
    ...tournament,
    matches: newMatches,
    champion: isChampion ? winner : tournament.champion,
    status: isChampion ? 'completed' : 'in-progress',
  };
}

export function resetMatch(tournament: Tournament, matchId: string): Tournament {
  const newMatches = tournament.matches.map(m => ({ ...m }));
  const match = newMatches.find(m => m.id === matchId);
  if (!match || !match.winner) return tournament;

  // Clear downstream matches recursively
  clearDownstream(match, newMatches);

  match.winner = null;

  return {
    ...tournament,
    matches: newMatches,
    champion: null,
    status: 'in-progress',
  };
}

function clearDownstream(match: Match, allMatches: Match[]) {
  if (match.nextMatchId && match.nextSlot) {
    const nextMatch = allMatches.find(m => m.id === match.nextMatchId);
    if (nextMatch) {
      // First, clear further downstream if this match had a winner
      if (nextMatch.winner) {
        clearDownstream(nextMatch, allMatches);
        nextMatch.winner = null;
      }
      nextMatch[match.nextSlot] = null;
    }
  }
}

function getSeedOrder(size: number): number[] {
  if (size === 1) return [0];
  const half = getSeedOrder(size / 2);
  return half.reduce<number[]>((result, pos) => {
    result.push(pos * 2);
    result.push(pos * 2 + 1);
    return result;
  }, []);
}

export function getRoundName(round: number, totalRounds: number): string {
  const fromFinal = totalRounds - round;
  if (fromFinal === 0) return 'Final';
  if (fromFinal === 1) return 'Semifinals';
  if (fromFinal === 2) return 'Quarterfinals';
  return `Round ${round}`;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
