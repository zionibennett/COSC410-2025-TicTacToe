from __future__ import annotations
from fastapi import APIRouter, HTTPException
from uuid import uuid4
from typing import Dict
from .engine import GameState, new_game, move, status
from .schemas import GameCreate, GameStateDTO, MoveRequest

router = APIRouter(prefix="/tictactoe", tags=["tictactoe"])

# naive in-memory store; swap for a real cache/DB as needed
GAMES: Dict[str, GameState] = {}

def _to_dto(game_id: str, gs: GameState) -> GameStateDTO:
    return GameStateDTO(
        id=game_id,
        board=gs.board,
        current_player=gs.current_player,
        winner=gs.winner,
        is_draw=gs.is_draw,
        status=status(gs),
    )

@router.post("/new", response_model=GameStateDTO)
def create_game(payload: GameCreate) -> GameStateDTO:
    gs = new_game()
    if payload.starting_player in ("X", "O"):
        gs.current_player = payload.starting_player  # type: ignore[assignment]
    gid = str(uuid4())
    GAMES[gid] = gs
    return _to_dto(gid, gs)

@router.get("/{game_id}", response_model=GameStateDTO)
def get_state(game_id: str) -> GameStateDTO:
    gs = GAMES.get(game_id)
    if not gs:
        raise HTTPException(status_code=404, detail="Game not found.")
    return _to_dto(game_id, gs)

@router.post("/{game_id}/move", response_model=GameStateDTO)
def make_move(game_id: str, req: MoveRequest) -> GameStateDTO:
    gs = GAMES.get(game_id)
    if not gs:
        raise HTTPException(status_code=404, detail="Game not found.")
    try:
        new_state = move(gs, req.index)
    except (IndexError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    GAMES[game_id] = new_state
    return _to_dto(game_id, new_state)

@router.delete("/{game_id}")
def delete_game(game_id: str) -> dict:
    if game_id in GAMES:
        del GAMES[game_id]
        return {"ok": True}
    return {"ok": False, "reason": "not found"}