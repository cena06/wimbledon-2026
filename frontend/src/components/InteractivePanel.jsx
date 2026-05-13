import { useState, useEffect } from 'react';
import { predictMatch } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RotateCcw, Download, Trophy } from 'lucide-react';

export default function InteractiveBracket({ players, tour }) {
  const [rounds, setRounds] = useState([]);
  const [champion, setChampion] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [matchPredictions, setMatchPredictions] = useState({});

  useEffect(() => {
    if (players.length >= 2) {
      initializeBracket();
    }
  }, [players]);

  const initializeBracket = () => {
    const size = Math.pow(2, Math.ceil(Math.log2(players.length)));
    const paddedPlayers = [...players];
    
    while (paddedPlayers.length < size) {
      paddedPlayers.push({ 
        name: 'BYE', 
        id: `bye-${paddedPlayers.length}`, 
        isBye: true,
        model_score: 0 
      });
    }

    const numRounds = Math.log2(size);
    const roundNames = ['R64', 'R32', 'R16', 'QF', 'SF', 'F'].slice(-numRounds);
    
    const initialRounds = [];
    
    // First round with seeded players
    const firstRoundMatches = [];
    for (let i = 0; i < paddedPlayers.length; i += 2) {
      firstRoundMatches.push({
        id: `r0-m${i/2}`,
        player1: paddedPlayers[i],
        player2: paddedPlayers[i + 1],
        winner: paddedPlayers[i + 1].isBye ? paddedPlayers[i] : null,
        probability1: null,
        probability2: null
      });
    }
    
    initialRounds.push({ name: roundNames[0], matches: firstRoundMatches });

    // Subsequent rounds
    let prevMatches = firstRoundMatches;
    for (let r = 1; r < numRounds; r++) {
      const roundMatches = [];
      for (let i = 0; i < prevMatches.length; i += 2) {
        roundMatches.push({
          id: `r${r}-m${i/2}`,
          player1: null,
          player2: null,
          winner: null,
          feedsFrom: [prevMatches[i].id, prevMatches[i + 1]?.id]
        });
      }
      initialRounds.push({ name: roundNames[r], matches: roundMatches });
      prevMatches = roundMatches;
    }

    setRounds(initialRounds);
    setChampion(null);
    setMatchPredictions({});
  };

  const simulateAllMatches = async () => {
    setSimulating(true);
    const newRounds = JSON.parse(JSON.stringify(rounds));
    const predictions = {};

    for (let r = 0; r < newRounds.length; r++) {
      for (let m = 0; m < newRounds[r].matches.length; m++) {
        const match = newRounds[r].matches[m];
        
        // Get players from previous round if needed
        if (r > 0) {
          const prevRound = newRounds[r - 1];
          const feedMatch1 = prevRound.matches[m * 2];
          const feedMatch2 = prevRound.matches[m * 2 + 1];
          match.player1 = feedMatch1?.winner || null;
          match.player2 = feedMatch2?.winner || null;
        }

        if (match.player1 && match.player2 && !match.player1.isBye && !match.player2.isBye) {
          try {
            const prediction = await predictMatch(match.player1.name, match.player2.name);
            match.probability1 = prediction.p1_probability;
            match.probability2 = prediction.p2_probability;
            
            // Simulate based on probability
            const random = Math.random();
            match.winner = random < prediction.p1_probability ? match.player1 : match.player2;
            
            predictions[match.id] = prediction;
          } catch (e) {
            // Fallback to model score comparison
            match.winner = match.player1.model_score >= match.player2.model_score 
              ? match.player1 
              : match.player2;
          }
        } else if (match.player1?.isBye) {
          match.winner = match.player2;
        } else if (match.player2?.isBye) {
          match.winner = match.player1;
        } else if (match.player1 && !match.player2) {
          match.winner = match.player1;
        } else if (match.player2 && !match.player1) {
          match.winner = match.player2;
        }

        // Small delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 100));
        setRounds([...newRounds]);
      }
    }

    // Set champion
    const finalMatch = newRounds[newRounds.length - 1].matches[0];
    setChampion(finalMatch.winner);
    setMatchPredictions(predictions);
    setSimulating(false);
  };

  const selectWinner = async (roundIndex, matchIndex, playerNum) => {
    const newRounds = JSON.parse(JSON.stringify(rounds));
    const match = newRounds[roundIndex].matches[matchIndex];
    
    match.winner = playerNum === 1 ? match.player1 : match.player2;

    // Propagate to next round
    if (roundIndex < newRounds.length - 1) {
      const nextMatch = newRounds[roundIndex + 1].matches[Math.floor(matchIndex / 2)];
      if (matchIndex % 2 === 0) {
        nextMatch.player1 = match.winner;
      } else {
        nextMatch.player2 = match.winner;
      }
    }

    // Check for champion
    if (roundIndex === newRounds.length - 1) {
      setChampion(match.winner);
    }

    setRounds(newRounds);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-wimbledon-gold" />
          Interactive Bracket
        </h2>
        <div className="flex gap-2">
          <button
            onClick={initializeBracket}
            className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={simulateAllMatches}
            disabled={simulating}
            className="px-4 py-2 bg-wimbledon-green text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {simulating ? 'Simulating...' : 'AI Simulate'}
          </button>
        </div>
      </div>

      {/* Bracket */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max py-4">
          {rounds.map((round, roundIndex) => (
            <div key={round.name} className="flex flex-col">
              <div className="text-center mb-4 sticky top-0 bg-white z-10 py-2">
                <span className="px-3 py-1 bg-wimbledon-green text-white text-sm font-semibold rounded-full">
                  {round.name}
                </span>
              </div>

              <div 
                className="flex flex-col justify-around flex-1"
                style={{ 
                  gap: `${Math.pow(2, roundIndex) * 24}px`,
                  paddingTop: `${Math.pow(2, roundIndex) * 12}px`
                }}
              >
                {round.matches.map((match, matchIndex) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onSelectWinner={(playerNum) => selectWinner(roundIndex, matchIndex, playerNum)}
                    isSimulating={simulating}
                    prediction={matchPredictions[match.id]}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Champion */}
          <AnimatePresence>
            {champion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex items-center justify-center"
              >
                <div className="bg-gradient-to-br from-wimbledon-gold via-yellow-400 to-amber-500 rounded-2xl p-8 text-center shadow-2xl">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Trophy className="w-16 h-16 mx-auto text-white mb-3" />
                  </motion.div>
                  <p className="text-white/80 text-sm mb-1">🏆 Champion</p>
                  <h2 className="text-2xl font-bold text-white">{champion.name}</h2>
                  <p className="text-white/80 text-sm mt-1">{champion.flag} {champion.country}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, onSelectWinner, isSimulating, prediction }) {
  const renderPlayer = (player, playerNum, probability) => {
    const isWinner = match.winner?.id === player?.id;
    const isLoser = match.winner && !isWinner;
    
    return (
      <motion.button
        disabled={!player || player.isBye || isSimulating}
        onClick={() => onSelectWinner(playerNum)}
        whileHover={player && !player.isBye ? { scale: 1.02 } : {}}
        whileTap={player && !player.isBye ? { scale: 0.98 } : {}}
        className={`
          w-full px-3 py-2 flex items-center gap-2 text-sm transition-all
          ${isWinner ? 'bg-green-100 font-bold text-green-800' : ''}
          ${isLoser ? 'opacity-40' : ''}
          ${player?.isBye ? 'text-gray-300 italic cursor-default' : 'hover:bg-gray-50'}
          ${!player ? 'text-gray-300 cursor-default' : 'cursor-pointer'}
        `}
      >
        {player ? (
          <>
            <span className="text-lg">{player.flag || '🎾'}</span>
            <span className="flex-1 truncate text-left">
              {player.isBye ? 'BYE' : player.name}
            </span>
            {probability && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                probability > 0.5 ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {Math.round(probability * 100)}%
              </span>
            )}
            {isWinner && <span className="text-green-600">✓</span>}
          </>
        ) : (
          <span className="text-gray-400 italic">TBD</span>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden w-52 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="border-b border-gray-100">
        {renderPlayer(match.player1, 1, match.probability1)}
      </div>
      {renderPlayer(match.player2, 2, match.probability2)}
    </motion.div>
  );
}
