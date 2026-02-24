import { useState } from 'react';
import { Player } from '../types';
import { createPlayer, shuffleArray } from '../utils/tournament';
import { cn } from '../utils/cn';

interface SetupPanelProps {
  onGenerateBracket: (players: Player[], tournamentName: string) => void;
}

const PRESET_NAMES = [
  'Alpha Wolf', 'Blaze', 'Cyclone', 'Dragon', 'Eclipse', 'Falcon',
  'Ghost', 'Havoc', 'Inferno', 'Jaguar', 'Kraken', 'Lightning',
  'Maverick', 'Nova', 'Omega', 'Phoenix', 'Quantum', 'Raptor',
  'Storm', 'Thunder', 'Ultra', 'Venom', 'Warden', 'Xenon',
  'Yeti', 'Zeus', 'Titan', 'Shadow', 'Viper', 'Rocket', 'Blitz', 'Fury',
];

export function SetupPanel({ onGenerateBracket }: SetupPanelProps) {
  const [tournamentName, setTournamentName] = useState('My Tournament');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const addPlayer = () => {
    const name = playerName.trim();
    if (!name) return;
    if (players.length >= 32) return;
    setPlayers([...players, createPlayer(name, players.length + 1)]);
    setPlayerName('');
  };

  const removePlayer = (id: string) => {
    const updated = players.filter(p => p.id !== id).map((p, i) => ({ ...p, seed: i + 1 }));
    setPlayers(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPlayer();
    }
  };

  const fillRandom = (count: number) => {
    const available = PRESET_NAMES.filter(n => !players.some(p => p.name === n));
    const shuffled = shuffleArray(available);
    const toAdd = shuffled.slice(0, Math.min(count, 32 - players.length));
    const newPlayers = [
      ...players,
      ...toAdd.map((name, i) => createPlayer(name, players.length + i + 1)),
    ];
    setPlayers(newPlayers);
  };

  const shufflePlayers = () => {
    const shuffled = shuffleArray(players).map((p, i) => ({ ...p, seed: i + 1 }));
    setPlayers(shuffled);
  };

  const clearAll = () => {
    setPlayers([]);
  };

  const canGenerate = players.length >= 2;

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const updated = [...players];
    const [removed] = updated.splice(draggedIdx, 1);
    updated.splice(idx, 0, removed);
    setPlayers(updated.map((p, i) => ({ ...p, seed: i + 1 })));
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200/50 mb-4">
          <span className="text-3xl">🏆</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tournament Generator</h1>
        <p className="text-gray-500">Add players, set seeds, and generate your bracket</p>
      </div>

      {/* Tournament Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tournament Name</label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg font-medium bg-white"
          placeholder="Enter tournament name..."
        />
      </div>

      {/* Add Player */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Add Players <span className="text-gray-400 font-normal">({players.length}/32)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
            placeholder="Enter player or team name..."
            maxLength={30}
          />
          <button
            onClick={addPlayer}
            disabled={!playerName.trim() || players.length >= 32}
            className={cn(
              "px-6 py-3 rounded-xl font-semibold transition-all",
              playerName.trim() && players.length < 32
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => fillRandom(4)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
        >
          + 4 Random
        </button>
        <button
          onClick={() => fillRandom(8)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
        >
          + 8 Random
        </button>
        <button
          onClick={() => fillRandom(16)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
        >
          + 16 Random
        </button>
        <button
          onClick={shufflePlayers}
          disabled={players.length < 2}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            players.length >= 2 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          🔀 Shuffle Seeds
        </button>
        <button
          onClick={clearAll}
          disabled={players.length === 0}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            players.length > 0 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          🗑 Clear All
        </button>
      </div>

      {/* Player List */}
      {players.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Players ({players.length})</h3>
            <p className="text-[10px] text-gray-400">Drag to reorder seeds</p>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {players.map((player, idx) => (
              <div
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border transition-all cursor-grab active:cursor-grabbing group",
                  draggedIdx === idx ? "border-indigo-400 shadow-lg scale-[1.02] opacity-80" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-1 text-gray-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {player.seed}
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{player.name}</span>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={() => canGenerate && onGenerateBracket(players, tournamentName || 'Tournament')}
        disabled={!canGenerate}
        className={cn(
          "w-full py-4 rounded-2xl font-bold text-lg transition-all",
          canGenerate
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        {canGenerate ? `⚡ Generate Bracket (${players.length} players)` : 'Add at least 2 players to generate'}
      </button>

      {canGenerate && (
        <p className="text-center text-xs text-gray-400 mt-3">
          {Math.pow(2, Math.ceil(Math.log2(players.length))) - players.length > 0 && (
            <span>{Math.pow(2, Math.ceil(Math.log2(players.length))) - players.length} bye(s) will be added • </span>
          )}
          {Math.ceil(Math.log2(players.length))} rounds • Single elimination
        </p>
      )}
    </div>
  );
}
