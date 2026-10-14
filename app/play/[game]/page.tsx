import React from 'react';
import type { Metadata } from 'next';
import { GameContainer } from '@/components/games/GameContainer';

const GAMES = ['target24', 'sudoku', 'wordle', 'slide', 'maze', 'blackjack', 'craps', 'snake', 'tetris', 'pong', '2048', 'minesweeper', 'asteroids', 'memory', 'typer'];

const GAME_METADATA: Record<string, { title: string; description: string }> = {
  target24: {
    title: 'Target 24',
    description: 'Use 4 numbers and basic operations (+, -, ×, ÷) to calculate exactly 24 in this fast-paced math puzzle.',
  },
  sudoku: {
    title: 'Sudoku',
    description: 'Play 9x9 Sudoku logic puzzle with Easy, Medium, and Hard difficulty modes in your browser.',
  },
  wordle: {
    title: 'Wordle',
    description: 'Guess the 5-letter tech word in 6 attempts with real-time feedback and hints.',
  },
  slide: {
    title: '15-Puzzle Slider',
    description: 'Classic 4x4 sliding number tile puzzle game with move and time tracking.',
  },
  maze: {
    title: 'Labyrinth',
    description: 'Procedurally generated maze puzzle game — navigate through walls to find the exit.',
  },
  blackjack: {
    title: 'Blackjack',
    description: 'Classic casino 21 blackjack table game with chip betting, dealer soft 17, and double down.',
  },
  craps: {
    title: 'Craps',
    description: 'Casino table dice game with Pass Line, Field bets, and 3D rolling dice.',
  },
  snake: {
    title: 'Snake',
    description: 'Classic grid snake retro arcade game with glowing trails, power-ups, and speed scaling.',
  },
  tetris: {
    title: 'Neon Tetris',
    description: 'Block-stacking puzzle classic with line clears, ghost piece, and high score tracking.',
  },
  pong: {
    title: 'Pong',
    description: 'Classic retro 1P vs AI or 2P local paddle challenge with dynamic speed ramps.',
  },
  '2048': {
    title: '2048',
    description: 'Slide, combine, and merge matching number tiles to reach the legendary 2048 tile.',
  },
  minesweeper: {
    title: 'Minesweeper',
    description: 'Classic grid minefield sweeper with safe first clicks, flagging, and timer.',
  },
  asteroids: {
    title: 'Space Blaster',
    description: 'Pilot your ship, blast cosmic asteroids, and dodge space debris in retro arcade style.',
  },
  memory: {
    title: 'Memory Match',
    description: 'Flip and match cyberpunk cards to test and train your visual memory.',
  },
  typer: {
    title: 'Speed Typer',
    description: 'Arcade typing challenge with code snippets, words-per-minute (WPM), and accuracy metrics.',
  },
};

export function generateStaticParams() {
  return GAMES.map(game => ({
    game,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const game = GAME_METADATA[resolvedParams.game] || {
    title: resolvedParams.game.charAt(0).toUpperCase() + resolvedParams.game.slice(1),
    description: `Play ${resolvedParams.game} online on ZEDF Arcade.`,
  };

  return {
    title: game.title,
    description: game.description,
    alternates: {
      canonical: `/play/${resolvedParams.game}`,
    },
    openGraph: {
      title: `${game.title} | ZEDF Arcade`,
      description: game.description,
      url: `https://www.zedf.co.uk/play/${resolvedParams.game}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${game.title} | ZEDF Arcade`,
      description: game.description,
    },
  };
}

export default async function DirectGamePage({ params }: { params: Promise<{ game: string }> }) {
  const resolvedParams = await params;
  return <GameContainer gameKey={resolvedParams.game} />;
}
