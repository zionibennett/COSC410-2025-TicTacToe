from fastapi import FastAPI
from app.tictactoe.router import router as t3_router

app = FastAPI()
app.include_router(t3_router)