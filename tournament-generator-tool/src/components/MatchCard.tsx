import { Match, Player } from '../types';
import { cn } from '../utils/cn';

interface MatchCardProps {
  match: Match;
  roundName: string;
  isFinal: boolean;
  onSelectWinner: (matchId: string, winner: Player) => void;
  onResetMatch: (matchId: string) => void;
}

export function MatchCard({ match, isFinal, onSelectWinner, onResetMatch }: MatchCardProps) {
  const canPlay = match.player1 !== null && match.player2 !== null && match.winner === null;
  const isBye = (match.player1 && !match.player2) || (!match.player1 && match.player2);

  return (
    <div className={cn(
      "relative w-52 rounded-xl border shadow-sm transition-all duration-300",
      isFinal && match.winner ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-yellow-200/50 shadow-lg" :
      match.winner ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50" :
      canPlay ? "border-blue-300 bg-white shadow-blue-100 shadow-md hover:shadow-lg" :
      "border-gray-200 bg-gray-50/80"
    )}>
      {/* Match header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-1.5 rounded-t-xl text-xs font-medium",
        isFinal && match.winner ? "bg-yellow-100 text-yellow-800" :
        match.winner ? "bg-emerald-100 text-emerald-700" :
        canPlay ? "bg-blue-50 text-blue-600" :
        "bg-gray-100 text-gray-500"
      )}>
        <span>Match {match.position + 1}</span>
        {match.winner && (
          <button
            onClick={() => onResetMatch(match.id)}
            className="text-[10px] hover:text-red-600 transition-colors px-1.5 py-0.5 rounded hover:bg-red-50"
            title="Reset match"
          >
            ↩ Reset
          </button>
        )}
      </div>

      {/* Players */}
      <div className="p-1.5 space-y-1">
        <PlayerSlot
          player={match.player1}
          isWinner={match.winner?.id === match.player1?.id}
          isLoser={match.winner !== null && match.winner?.id !== match.player1?.id}
          canSelect={canPlay}
          onClick={() => match.player1 && onSelectWinner(match.id, match.player1)}
        />
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-400">VS</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <PlayerSlot
          player={match.player2}
          isWinner={match.winner?.id === match.player2?.id}
          isLoser={match.winner !== null && match.winner?.id !== match.player2?.id}
          canSelect={canPlay}
          onClick={() => match.player2 && onSelectWinner(match.id, match.player2)}
        />
      </div>

      {/* Bye indicator */}
      {isBye && (
        <div className="px-3 pb-2 text-center">
          <span className="text-[10px] text-gray-400 italic">BYE - Auto advance</span>
        </div>
      )}
    </div>
  );
}

function PlayerSlot({
  player,
  isWinner,
  isLoser,
  canSelect,
  onClick,
}: {
  player: Player | null;
  isWinner: boolean;
  isLoser: boolean;
  canSelect: boolean;
  onClick: () => void;
}) {
  if (!player) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100/50 border border-dashed border-gray-200">
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-xs">?</span>
        </div>
        <span className="text-xs text-gray-400 italic">TBD</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!canSelect}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left",
        isWinner && "bg-emerald-100 border border-emerald-300 ring-1 ring-emerald-200",
        isLoser && "bg-gray-100 border border-gray-200 opacity-50",
        !isWinner && !isLoser && canSelect && "bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm cursor-pointer",
        !isWinner && !isLoser && !canSelect && "bg-white border border-gray-200",
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        isWinner ? "bg-emerald-500 text-white" :
        isLoser ? "bg-gray-300 text-gray-500" :
        "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
      )}>
        {player.seed}
      </div>
      <span className={cn(
        "text-sm font-medium truncate",
        isWinner ? "text-emerald-800" :
        isLoser ? "text-gray-400 line-through" :
        "text-gray-800"
      )}>
        {player.name}
      </span>
      {isWinner && (
        <span className="ml-auto text-emerald-500 text-sm">✓</span>
      )}
    </button>
  );
}
