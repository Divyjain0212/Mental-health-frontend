import React, { useEffect, useState } from 'react';

// Simple Memory Match Game (IQ booster) and Breathing Relaxer button

type Card = { id: number; value: string; flipped: boolean; matched: boolean };

const values = ['🙂','🌟','🎯','🧠','📚','🎵','🌿','⚡'];

const createDeck = (): Card[] => {
  const doubled = [...values, ...values];
  const deck = doubled.map((val, idx) => ({ id: idx, value: val, flipped: false, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const Games: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const flipCard = (id: number) => {
    setDeck(prev => prev.map(c => (c.id === id && !c.matched ? { ...c, flipped: !c.flipped } : c)));
    setSelected(prev => prev.length < 2 ? [...prev, id] : prev);
  };

  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      const ca = deck.find(c => c.id === a);
      const cb = deck.find(c => c.id === b);
      setMoves(m => m + 1);
      if (ca && cb && ca.value === cb.value) {
        setDeck(prev => prev.map(c => (c.id === a || c.id === b ? { ...c, matched: true } : c)));
        setSelected([]);
      } else {
        setTimeout(() => {
          setDeck(prev => prev.map(c => (c.id === a || c.id === b ? { ...c, flipped: false } : c)));
          setSelected([]);
        }, 800);
      }
    }
  }, [selected, deck]);

  const reset = () => {
    setDeck(createDeck());
    setSelected([]);
    setMoves(0);
  };

  const allMatched = deck.every(c => c.matched);

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Games</h2>
          <button onClick={reset} className="px-3 py-1 bg-blue-600 text-white rounded">Reset</button>
        </div>
        <p className="text-gray-600 mb-4">Moves: {moves} {allMatched && <span className="ml-2 text-green-600 font-semibold">Completed!</span>}</p>
        <div className="grid grid-cols-4 gap-4 bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-100 shadow-lg">
          {deck.map(card => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              className={`h-20 rounded flex items-center justify-center text-2xl border ${card.flipped || card.matched ? 'bg-white' : 'bg-blue-100'} ${card.matched ? 'ring-2 ring-green-500' : ''}`}
              disabled={card.matched || (selected.length === 2 && !card.flipped)}
            >
              {card.flipped || card.matched ? card.value : '❓'}
            </button>
          ))}
        </div>

        <div className="mt-10 bg-white/80 backdrop-blur p-6 rounded-xl border border-gray-100 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Quick Relaxer</h3>
          <p className="text-gray-600 mb-3">Open Relaxation to try guided breathing and calming audio.</p>
          <a href="/relaxation" className="px-4 py-2 bg-green-600 text-white rounded">Go to Relaxation</a>
        </div>
      </div>
    </section>
  );
};

export default Games;


