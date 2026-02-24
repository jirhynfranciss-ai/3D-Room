import { Tournament, Player } from '../types';
import { getRoundName } from '../utils/tournament';
import { MatchCard } from './MatchCard';
import { cn } from '../utils/cn';

interface BracketProps {
  tournament: Tournament;
  onSelectWinner: (matchId: string, winner: Player) => void;
  onResetMatch: (matchId: string) => void;
}

export function Bracket({ tournament, onSelectWinner, onResetMatch }: BracketProps) {
  const rounds: number[] = [];
  for (let i = 1; i <= tournament.rounds; i++) {
    rounds.push(i);
  }

  return (
    <div className="w-full overflow-x-auto pb-8">
      {/* Champion display */}
      {tournament.champion && (
        <div className="flex justify-center mb-8 animate-bounce-slow">
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl p-[2px] shadow-xl shadow-yellow-200/50">
            <div className="bg-white rounded-2xl px-8 py-5 text-center">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-widest mb-1">Champion</p>
              <p className="text-xl font-bold text-gray-900">{tournament.champion.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bracket grid */}
      <div className="flex gap-0 items-stretch min-w-max px-4">
        {rounds.map((round) => {
          const roundMatches = tournament.matches
            .filter(m => m.round === round)
            .sort((a, b) => a.position - b.position);
          const roundName = getRoundName(round, tournament.rounds);
          const isFinal = round === tournament.rounds;

          return (
            <div key={round} className="flex flex-col items-center">
              {/* Round header */}
              <div className={cn(
                "mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap",
                isFinal ? "bg-yellow-100 text-yellow-700" :
                round === tournament.rounds - 1 ? "bg-purple-100 text-purple-700" :
                "bg-gray-100 text-gray-600"
              )}>
                {roundName}
              </div>

              {/* Matches */}
              <div className="flex flex-col justify-around flex-1 gap-4">
                {roundMatches.map((match) => (
                  <div key={match.id} className="flex items-center">
                    <MatchCard
                      match={match}
                      roundName={roundName}
                      isFinal={isFinal}
                      onSelectWinner={onSelectWinner}
                      onResetMatch={onResetMatch}
                    />
                    {/* Connector lines */}
                    {!isFinal && (
                      <div className="w-8 flex items-center">
                        <div className="w-full h-px bg-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
