import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TicTacToe, { computeWinner } from "../components/TicTacToe";

describe("computeWinner", () => {
  it("detects wins", () => {
    expect(computeWinner(["X","X","X", null,null,null, null,null,null])).toBe("X");
    expect(computeWinner(["O",null,null, "O",null,null, "O",null,null])).toBe("O");
    expect(computeWinner(["X",null,null, null,"X",null, null,null,"X"])).toBe("X");
  });

  it("returns null when no winner", () => {
    expect(computeWinner([null,null,null,null,null,null,null,null,null])).toBeNull();
  });
});

describe("TicTacToe component", () => {
  it("plays a simple game and declares winner", () => {
    const onWin = vi.fn();
    render(<TicTacToe onWin={onWin} />);

    // X 0, O 3, X 1, O 4, X 2 -> X wins
    fireEvent.click(screen.getByLabelText("cell-0"));
    fireEvent.click(screen.getByLabelText("cell-3"));
    fireEvent.click(screen.getByLabelText("cell-1"));
    fireEvent.click(screen.getByLabelText("cell-4"));
    fireEvent.click(screen.getByLabelText("cell-2"));

    expect(screen.getByText(/X wins/i)).toBeInTheDocument();
    expect(onWin).toHaveBeenCalledWith("X");
  });

  it("prevents moves in occupied cells", () => {
    render(<TicTacToe />);
    const c0 = screen.getByLabelText("cell-0");
    fireEvent.click(c0);
    fireEvent.click(c0); // second click ignored
    expect(c0.textContent).toBe("X");
  });
});