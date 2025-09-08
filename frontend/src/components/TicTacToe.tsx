import React from "react";

type Player = "X" | "O";
type Cell = Player | null;

type Props = {
  onWin?: (winner: Player | "draw" | null) => void;
};

export default function TicTacToe({ onWin }: Props) {
  const [board, setBoard] = React.useState<Cell[]>(Array(9).fill(null));
  const [player, setPlayer] = React.useState<Player>("X");
  const winner = computeWinner(board);
  const isDraw = !winner && board.every((c) => c !== null);

  React.useEffect(() => {
    if (winner && onWin) onWin(winner);
    else if (isDraw && onWin) onWin("draw");
  }, [winner, isDraw, onWin]);

  function handleClick(i: number) {
    if (winner || isDraw || board[i] !== null) return;
    const next = board.slice();
    next[i] = player;
    setBoard(next);
    setPlayer(player === "X" ? "O" : "X");
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setPlayer("X");
  }

  return (
    <div className="max-w-sm mx-auto p-4">
      <div className="text-center mb-2 text-xl font-semibold">
        {winner ? `${winner} wins` : isDraw ? "Draw" : `${player}'s turn`}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button
            key={i}
            className="aspect-square rounded-2xl border text-3xl font-bold flex items-center justify-center"
            onClick={() => handleClick(i)}
            aria-label={`cell-${i}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="text-center mt-3">
        <button className="rounded-2xl px-4 py-2 border" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}

export function computeWinner(b: Cell[]): Player | null {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b2,c] of lines) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  }
  return null;
}