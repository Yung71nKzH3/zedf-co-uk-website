import React from 'react';
import { GameContainer } from '@/components/games/GameContainer';

const GAMES = ['sudoku', 'wordle', 'slide', 'maze', 'blackjack', 'craps', 'snake', 'tetris', 'pong', '2048', 'minesweeper', 'asteroids', 'memory', 'typer'];

export function generateStaticParams() {
  return GAMES.map(game => ({
    game,
  }));
}

export default async function DirectGamePage({ params }: { params: Promise<{ game: string }> }) {
  const resolvedParams = await params;
  return <GameContainer gameKey={resolvedParams.game} />;
}
