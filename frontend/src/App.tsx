import React from "react";
import TicTacToe from "@/components/TicTacToe";


export default function App() {

const [gameKey, setGameKey] = React.useState(0);

function resetGame() {
  
  setResults(Array(9).fill(null));
  setBigWinner(null);
  
  setCurrentPlayer("X");
  setLastCell(null);
  
  setActiveBoard(null);

  
  setGameKey((prev) => prev + 1);
}


function handleWin(index: number, winner: string | null) {
    setResults((prev) => {
      const copy = [...prev];
      copy[index] = winner;
      return copy;
    });
  }

function handleCellClick(cellIndex: number) {
  if (results[cellIndex] !== null) {
    setActiveBoard(null);
  } else {
    setActiveBoard(cellIndex);
   
  setCurrentPlayer((prev) => {
    const next = prev === "X" ? "O" : "X";
    console.log("Flipping turn:", prev, "→", next);
    return next;
  });
  }

}


  function checkWinner(board: (string | null)[]): string | null {
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],             // diagonals
  ];

  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // "X" or "O"
    }
  }

  if (board.every(cell => cell !== null)) {
    return "draw";
  }

  return null; 
}


  const [results, setResults] = React.useState<(string | null)[]>(
    Array(9).fill(null)
  );
  const [bigWinner, setBigWinner] = React.useState<string | null>(null);
  const [activeBoard, setActiveBoard] = React.useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = React.useState<"X" | "O">("X");
  const [lastCell, setLastCell] = React.useState<number | null>(null);

  React.useEffect(() => {
  if (lastCell === null) {
    setActiveBoard(null);
    return;
  }
  
  if (results[lastCell] !== null) {
    setActiveBoard(null);
  } else {
    setActiveBoard(lastCell);
  }
}, [results, lastCell]);


  React.useEffect(() => {
  const w = checkWinner(results);
  setBigWinner(w);
}, [results]);


  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-4">
        ULTIMATE TicTacToe
      </h1>

    <div className="mt-6 text-center">
  <h2 className="text-xl font-bold">Current Player</h2>
  <div className="inline-block px-6 py-3 border rounded-2xl text-2xl font-bold bg-gray-100">
    {currentPlayer}
  </div>
</div>


      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, boardIndex) => (
  <TicTacToe
  key={`${gameKey}-${boardIndex}`} 
  onWin={(winner) => handleWin(boardIndex, winner)}
  onCellClick={(cellIndex) => {
    setLastCell(cellIndex);

  
  setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
    
  }}
  disabled={bigWinner != null || activeBoard !== null && activeBoard !== boardIndex}
  currentPlayer={currentPlayer}
/>


))}
<button
    className="rounded-2xl px-6 py-2 justify-center border text-lg font-bold"
    onClick={resetGame}
  >
    New Game
  </button>
      </div>
      <div className="mt-6 text-center text-xl font-bold">
  {bigWinner
    ? bigWinner === "draw"
      ? "Overall Game: Draw"
      : `Overall Winner: ${bigWinner}`
    : "Overall Game in Progress"}
</div>

      <div className="mt-6">
  <h2 className="text-xl font-bold mb-2">Progress Board</h2>
  <div className="grid grid-cols-3 gap-2">
    {results.map((r, i) => (
      <div
  key={i}
  className="aspect-square flex items-center justify-center border text-lg font-semibold"
>
  {r === "draw" ? "–" : r ?? ""}
</div>

    ))}
    <div className="mt-6 text-center">
  
</div>
  </div>
</div>
    </div>
  );
  
}



