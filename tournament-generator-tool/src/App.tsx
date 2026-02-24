import { useState } from 'react';
import { Tournament, Player } from './types';
import { generateBracket, setMatchWinner, resetMatch } from './utils/tournament';
import { SetupPanel } from './components/SetupPanel';
import { Bracket } from './components/Bracket';
import { cn } from './utils/cn';

export function App() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [view, setView] = useState<'setup' | 'bracket'>('setup');

  const handleGenerateBracket = (players: Player[], name: string) => {
    const t = generateBracket(players, name);
    setTournament(t);
    setView('bracket');
  };

  const handleSelectWinner = (matchId: string, winner: Player) => {
    if (!tournament) return;
    setTournament(setMatchWinner(tournament, matchId, winner));
  };

  const handleResetMatch = (matchId: string) => {
    if (!tournament) return;
    setTournament(resetMatch(tournament, matchId));
  };

  const handleBackToSetup = () => {
    setView('setup');
  };

  const handleNewTournament = () => {
    setTournament(null);
    setView('setup');
  };

  const completedMatches = tournament?.matches.filter(m => m.winner !== null).length ?? 0;
  const totalPlayableMatches = tournament?.matches.filter(m => m.player1 || m.player2).length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {view === 'setup' && (
        <div className="p-6 md:p-12">
          <SetupPanel onGenerateBracket={handleGenerateBracket} />
        </div>
      )}

      {view === 'bracket' && tournament && (
        <div className="min-h-screen flex flex-col">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToSetup}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                  title="Back to setup"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span>🏆</span>
                    {tournament.name}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {tournament.players.length} players • {tournament.rounds} rounds • Single Elimination
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        tournament.champion ? "bg-gradient-to-r from-yellow-400 to-amber-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      )}
                      style={{ width: `${totalPlayableMatches > 0 ? (completedMatches / totalPlayableMatches) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {completedMatches}/{totalPlayableMatches}
                  </span>
                </div>

                {/* Status badge */}
                <div className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider",
                  tournament.champion ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-600"
                )}>
                  {tournament.champion ? '🎉 Complete' : '⚡ In Progress'}
                </div>

                <button
                  onClick={handleNewTournament}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:shadow-lg"
                >
                  + New
                </button>
              </div>
            </div>
          </header>

          {/* Bracket Instructions */}
          {!tournament.champion && (
            <div className="px-6 pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
                <span className="text-blue-500 text-lg">💡</span>
                <p className="text-xs text-blue-700">
                  Click on a <strong>player's name</strong> to select them as the match winner. Winners automatically advance to the next round.
                </p>
              </div>
            </div>
          )}

          {/* Bracket Area */}
          <div className="flex-1 p-6 overflow-x-auto">
            <Bracket
              tournament={tournament}
              onSelectWinner={handleSelectWinner}
              onResetMatch={handleResetMatch}
            />
          </div>

          {/* Stats Footer */}
          <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur px-6 py-3">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Completed: {completedMatches}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Remaining: {totalPlayableMatches - completedMatches}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                Total Matches: {tournament.matches.length}
              </span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
