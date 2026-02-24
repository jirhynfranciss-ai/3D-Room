export interface Player {
  id: string;
  name: string;
  seed: number;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  winner: Player | null;
  nextMatchId: string | null;
  nextSlot: 'player1' | 'player2' | null;
}

export interface Tournament {
  id: string;
  name: string;
  players: Player[];
  matches: Match[];
  rounds: number;
  champion: Player | null;
  status: 'setup' | 'in-progress' | 'completed';
}
