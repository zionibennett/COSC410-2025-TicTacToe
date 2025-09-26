from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, HTTPException

from .engine import GameState, move, new_game, status
from .schemas import GameCreate, GameStateDTO, MoveRequest

router = APIRouter(prefix="/tictactoe", tags=["tictactoe"])

# naive in-memory store; swap for a real cache/DB as needed
GAMES: dict[str, list[GameState]] = {}


def _to_dto(game_id: str, gs: GameState) -> GameStateDTO:
    return GameStateDTO(
        id=game_id,
        board=gs.board,
        winner=gs.winner,
        is_draw=gs.is_draw,
        status=status(gs),
    )


@router.post("/new", response_model=GameStateDTO)
def create_game(payload: GameCreate) -> GameStateDTO:
    gs = new_game()

    gid = str(uuid4())
    GAMES[gid] = [gs]
    return _to_dto(gid, gs)


@router.get("/{game_id}", response_model=GameStateDTO)
def get_state(game_id: str) -> GameStateDTO:
    gs = GAMES.get(game_id)
    if gs is None:  # ✅ guard against None
        raise HTTPException(status_code=404, detail="Game not found.")
    return _to_dto(game_id, gs[-1])


@router.get("/{game_id}/history", response_model=list[GameStateDTO])
def get_history(game_id: str) -> list[GameStateDTO]:  # ✅ renamed, proper return type
    gs = GAMES.get(game_id)
    if gs is None:
        raise HTTPException(status_code=404, detail="Game not found.")
    return [_to_dto(game_id, g) for g in gs]


@router.post("/{game_id}/move", response_model=GameStateDTO)
def make_move(game_id: str, payload: MoveRequest) -> GameStateDTO:
    gs = GAMES.get(game_id)
    if gs is None:  # ✅ guard here too
        raise HTTPException(status_code=404, detail="Game not found.")
    try:
        new_state = move(gs[-1], payload.index, payload.player)
    except (IndexError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e)) from e  # ✅ Ruff-friendly
    GAMES[game_id].append(new_state)
    return _to_dto(game_id, new_state)


@router.delete("/{game_id}")
def delete_game(game_id: str) -> dict:
    if game_id in GAMES:
        del GAMES[game_id]
        return {"ok": True}
    return {"ok": False, "reason": "not found"}
