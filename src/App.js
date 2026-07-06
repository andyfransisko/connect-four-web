import React, { useState, useCallback } from 'react';
import './App.css';

const ROWS = 6;
const COLS = 7;

const PLAYERS = {
  1: { name: 'Red',    cls: 'red'    },
  2: { name: 'Yellow', cls: 'yellow' },
};

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function checkWin(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    let n = 1;
    for (let s = 1; s < 4; s++) {
      const r = row + dr*s, c = col + dc*s;
      if (r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==player) break;
      n++;
    }
    for (let s = 1; s < 4; s++) {
      const r = row - dr*s, c = col - dc*s;
      if (r<0||r>=ROWS||c<0||c>=COLS||board[r][c]!==player) break;
      n++;
    }
    if (n >= 4) return true;
  }
  return false;
}

let dropSeq = 0;

export default function App() {
  const [board, setBoard]           = useState(createBoard);
  const [player, setPlayer]         = useState(1);
  const [winner, setWinner]         = useState(null);
  const [draw, setDraw]             = useState(false);
  const [hoverCol, setHoverCol]     = useState(null);
  const [lastDrop, setLastDrop]     = useState(null);

  const drop = useCallback((col) => {
    if (winner || draw) return;
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 0) { row = r; break; }
    }
    if (row < 0) return;

    const next = board.map(r => [...r]);
    next[row][col] = player;
    dropSeq++;
    setBoard(next);
    setLastDrop({ row, col, seq: dropSeq });

    if (checkWin(next, row, col, player)) {
      setWinner(player);
    } else if (next[0].every(c => c !== 0)) {
      setDraw(true);
    } else {
      setPlayer(p => p === 1 ? 2 : 1);
    }
  }, [board, player, winner, draw]);

  const restart = useCallback(() => {
    setBoard(createBoard());
    setPlayer(1);
    setWinner(null);
    setDraw(false);
    setHoverCol(null);
    setLastDrop(null);
  }, []);

  const gameOver = winner !== null || draw;

  return (
    <div className="app">
      <h1 className="game-title">Connect Four</h1>

      <div className={`status-bar${winner ? ` status-win-${PLAYERS[winner].cls}` : ''}`}>
        {winner ? (
          <>
            <span className={`chip chip-${PLAYERS[winner].cls}`} />
            <span className="status-text">{PLAYERS[winner].name} wins!</span>
          </>
        ) : draw ? (
          <span className="status-text">It&apos;s a draw!</span>
        ) : (
          <>
            <span className={`chip chip-${PLAYERS[player].cls}`} />
            <span className="status-text">{PLAYERS[player].name}&apos;s turn</span>
          </>
        )}
      </div>

      <div
        className="board-wrap"
        onMouseLeave={() => setHoverCol(null)}
      >
        {/* Drop-preview row above the board */}
        <div className="preview-row">
          {Array.from({ length: COLS }, (_, col) => (
            <div
              key={col}
              className="preview-cell"
              onMouseEnter={() => !gameOver && setHoverCol(col)}
              onClick={() => drop(col)}
            >
              {hoverCol === col && !gameOver && (
                <div className={`preview-disc disc-${PLAYERS[player].cls}`} />
              )}
            </div>
          ))}
        </div>

        {/* The board */}
        <div className="board">
          {Array.from({ length: COLS }, (_, col) => (
            <div
              key={col}
              className={`col${hoverCol === col && !gameOver ? ' col-hover' : ''}`}
              onMouseEnter={() => !gameOver && setHoverCol(col)}
              onClick={() => drop(col)}
              role="button"
              tabIndex={0}
              aria-label={`Column ${col + 1}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') drop(col); }}
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const cell = board[row][col];
                const isNew = lastDrop && lastDrop.row === row && lastDrop.col === col;
                return (
                  <div key={row} className="cell">
                    {cell !== 0 && (
                      <div
                        key={isNew ? `d-${lastDrop.seq}` : `s-${row}-${col}`}
                        className={`disc disc-${PLAYERS[cell].cls}${isNew ? ' disc-drop' : ''}`}
                        style={isNew ? { '--fall-rows': row + 1 } : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button className="btn-new-game" onClick={restart}>
        New Game
      </button>

      {gameOver && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="overlay-card">
            {winner ? (
              <>
                <div className={`overlay-disc disc-${PLAYERS[winner].cls}`} />
                <p className="overlay-title">{PLAYERS[winner].name} Wins!</p>
              </>
            ) : (
              <p className="overlay-title">It&apos;s a Draw!</p>
            )}
            <button className="btn-play-again" onClick={restart}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
