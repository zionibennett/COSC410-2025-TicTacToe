import React from "react";

type Player = "X" | "O";
type Cell = Player | null;

type Props = {
  onWin?: (winner: Player | "draw" | null) => void;
  onCellClick?: (cellIndex: number) => void;
  disabled?: boolean;
  currentPlayer: Player;
};

// ----- Backend DTOs -----
type GameStateDTO = {
  id: string;
  board: Cell[];
  
  winner: Player | null;
  is_draw: boolean;
  status: string;
};

// Prefer env, fallback to localhost:8000
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";



export default function TicTacToe({ onWin,onCellClick,disabled,currentPlayer }: Props) {
  const [state, setState] = React.useState<GameStateDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  

  
  React.useEffect(() => {
    let canceled = false;
    async function start() {
      setError(null);
      setLoading(true);
      try {
        const gs = await createGame();
        if (!canceled) setState(gs);
      } catch (e: any) {
        if (!canceled) setError(e?.message ?? "Failed to start game");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    start();
    return () => {
      canceled = true;
    };
  }, []);

 
  React.useEffect(() => {
  if (!onWin) return;
  if (state?.winner) {
    onWin(state.winner);
  } else if (state?.is_draw) {
    onWin("draw");
  } else {
    onWin(null);
  }
}, [state?.winner, state?.is_draw, onWin]);  


  async function createGame(): Promise<GameStateDTO> {
    const r = await fetch(`${API_BASE}/tictactoe/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starting_player: currentPlayer}),
    });
    if (!r.ok) throw new Error(`Create failed: ${r.status}`);
    return r.json();
  }

  async function playMove(index: number, player: Player): Promise<GameStateDTO> {
    if (!state) throw new Error("No game");

    const playerForThisMove = currentPlayer;  

    const r = await fetch(`${API_BASE}/tictactoe/${state.id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, player}),
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      throw new Error(detail?.detail ?? `Move failed: ${r.status}`);
    }
    return r.json();
  }

  async function handleClick(i: number) {
    if (!state || loading) return;
    
    if (state.winner || state.is_draw || state.board[i] !== null) return;

    const playerForThisMove = currentPlayer;  

    setLoading(true);
    setError(null);
    try {
      console.log("Sending move:", { index: i, player: playerForThisMove });

      const next = await playMove(i,playerForThisMove);
      setState(next);
      if (onCellClick) {
    onCellClick(i);
  }
    } catch (e: any) {
      setError(e?.message ?? "Move failed");
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setLoading(true);
    setError(null);
    try {
      const gs = await createGame();
      setState(gs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to reset");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-sm mx-auto p-4">
        <div className="mb-2 text-red-600 font-semibold">Error: {error}</div>
        <button className="rounded-2xl px-4 py-2 border" onClick={reset}>
          Retry
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="max-w-sm mx-auto p-4">
        <div className="text-center">Loading…</div>
      </div>
    );
  }

  const { board, winner, is_draw } = state;
  <div className="text-center mb-2 text-xl font-semibold">
  {winner
    ? `${winner} wins`
    : is_draw
      ? "Draw"
      : `${currentPlayer}'s turn`}
</div>

  return (
  <div className="w-full h-full p-2">
    <div className="grid grid-cols-3 gap-2 w-full h-full">
      {board.map((c, i) => {
  const displayValue =
    state.winner !== null ? state.winner : c; 
  return (
    <button
      key={i}
      className={`aspect-square min-w-[80px] min-h-[80px] rounded-2xl border text-3xl font-bold flex items-center justify-center
        ${
          !disabled && !loading && c === null && state.winner === null && !state.is_draw
            ? "bg-green-100 hover:bg-green-200"
            : ""
        }
        disabled:opacity-50`}
      onClick={() => {
        if (disabled) return;
        handleClick(i);
        
      }}
      disabled={
        disabled ||
        loading ||
        c !== null ||
        state.winner !== null ||
        state.is_draw
      }
    >
      {displayValue}
    </button>
  );
})}

    </div>
  </div>
)}

