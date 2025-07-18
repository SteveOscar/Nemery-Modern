import { useState, useEffect, useCallback } from 'react';
import storageService from '../services/storage';

const BOARD_SIZE = 4;
const WINNING_TILE = 2048;

export const useGameLogic = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [canUndo, setCanUndo] = useState(false);

  // Initialize game state
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    try {
      const savedBestScore = await storageService.getBestScore();
      setBestScore(savedBestScore);

      const savedGameState = await storageService.getGameState();
      if (savedGameState && savedGameState.board) {
        setBoard(savedGameState.board);
        setScore(savedGameState.score);
        setGameOver(savedGameState.gameOver);
        setGameWon(savedGameState.gameWon);
        setMoveHistory(savedGameState.moveHistory || []);
        setCanUndo(savedGameState.moveHistory?.length > 0);
      } else {
        resetGame();
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      resetGame();
    }
  };

  const createEmptyBoard = () => {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(0));
  };

  const addRandomTile = useCallback((currentBoard) => {
    const emptyCells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length === 0) return currentBoard;

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;

    return newBoard;
  }, []);

  const resetGame = useCallback(async () => {
    const newBoard = createEmptyBoard();
    const initialBoard = addRandomTile(addRandomTile(newBoard));

    setBoard(initialBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setMoveHistory([]);
    setCanUndo(false);

    await saveGameState(initialBoard, 0, false, false, []);
  }, [addRandomTile]);

  const saveGameState = async (currentBoard, currentScore, isGameOver, isGameWon, history) => {
    try {
      await storageService.saveGameState({
        board: currentBoard,
        score: currentScore,
        gameOver: isGameOver,
        gameWon: isGameWon,
        moveHistory: history,
      });
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  const moveTiles = useCallback(
    async (direction) => {
      const newBoard = board.map((row) => [...row]);
      let moved = false;
      let newScore = score;

      const moveRow = (row, direction) => {
        const filtered = row.filter((cell) => cell !== 0);
        const merged = [];

        for (let i = 0; i < filtered.length; i++) {
          if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            const mergedValue = filtered[i] * 2;
            merged.push(mergedValue);
            newScore += mergedValue;
            if (mergedValue === WINNING_TILE && !gameWon) {
              setGameWon(true);
            }
            i++;
          } else {
            merged.push(filtered[i]);
          }
        }

        while (merged.length < BOARD_SIZE) {
          merged.push(0);
        }

        return merged;
      };

      const moveColumn = (col, direction) => {
        const column = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
          column.push(newBoard[i][col]);
        }

        const filtered = column.filter((cell) => cell !== 0);
        const merged = [];

        for (let i = 0; i < filtered.length; i++) {
          if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            const mergedValue = filtered[i] * 2;
            merged.push(mergedValue);
            newScore += mergedValue;
            if (mergedValue === WINNING_TILE && !gameWon) {
              setGameWon(true);
            }
            i++;
          } else {
            merged.push(filtered[i]);
          }
        }

        while (merged.length < BOARD_SIZE) {
          merged.push(0);
        }

        return merged;
      };

      // Save current state for undo
      const currentState = {
        board: board.map((row) => [...row]),
        score,
        gameWon,
      };

      // Apply move based on direction
      switch (direction) {
        case 'left':
          for (let i = 0; i < BOARD_SIZE; i++) {
            const newRow = moveRow(newBoard[i], direction);
            if (JSON.stringify(newRow) !== JSON.stringify(newBoard[i])) {
              moved = true;
            }
            newBoard[i] = newRow;
          }
          break;
        case 'right':
          for (let i = 0; i < BOARD_SIZE; i++) {
            const newRow = moveRow(newBoard[i].reverse(), direction).reverse();
            if (JSON.stringify(newRow) !== JSON.stringify(newBoard[i])) {
              moved = true;
            }
            newBoard[i] = newRow;
          }
          break;
        case 'up':
          for (let j = 0; j < BOARD_SIZE; j++) {
            const newCol = moveColumn(j, direction);
            if (JSON.stringify(newCol) !== JSON.stringify(newBoard.map((row) => row[j]))) {
              moved = true;
            }
            for (let i = 0; i < BOARD_SIZE; i++) {
              newBoard[i][j] = newCol[i];
            }
          }
          break;
        case 'down':
          for (let j = 0; j < BOARD_SIZE; j++) {
            const column = newBoard.map((row) => row[j]).reverse();
            const newCol = moveColumn(j, direction).reverse();
            if (JSON.stringify(newCol) !== JSON.stringify(column)) {
              moved = true;
            }
            for (let i = 0; i < BOARD_SIZE; i++) {
              newBoard[i][j] = newCol[i];
            }
          }
          break;
      }

      if (moved) {
        const newBoardWithTile = addRandomTile(newBoard);
        const newHistory = [...moveHistory, currentState];

        setBoard(newBoardWithTile);
        setScore(newScore);
        setMoveHistory(newHistory);
        setCanUndo(true);

        // Check for game over
        if (isGameOver(newBoardWithTile)) {
          setGameOver(true);
          await handleGameOver(newScore);
        }

        await saveGameState(newBoardWithTile, newScore, false, gameWon, newHistory);

        // Update best score if necessary
        if (newScore > bestScore) {
          setBestScore(newScore);
          await storageService.saveBestScore(newScore);
        }
      }

      return moved;
    },
    [board, score, gameWon, moveHistory, bestScore, addRandomTile]
  );

  const isGameOver = useCallback((currentBoard) => {
    // Check if there are any empty cells
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (currentBoard[i][j] === 0) return false;
      }
    }

    // Check if any merges are possible
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const current = currentBoard[i][j];
        if (
          (i < BOARD_SIZE - 1 && currentBoard[i + 1][j] === current) ||
          (j < BOARD_SIZE - 1 && currentBoard[i][j + 1] === current)
        ) {
          return false;
        }
      }
    }

    return true;
  }, []);

  const handleGameOver = async (finalScore) => {
    try {
      await storageService.updateGameStatistics({
        score: finalScore,
        highestTile: Math.max(...board.flat()),
        moves: moveHistory.length,
      });
    } catch (error) {
      console.error('Failed to update game statistics:', error);
    }
  };

  const undo = useCallback(async () => {
    if (moveHistory.length === 0) return;

    const lastState = moveHistory[moveHistory.length - 1];
    const newHistory = moveHistory.slice(0, -1);

    setBoard(lastState.board);
    setScore(lastState.score);
    setGameWon(lastState.gameWon);
    setMoveHistory(newHistory);
    setCanUndo(newHistory.length > 0);
    setGameOver(false);

    await saveGameState(lastState.board, lastState.score, false, lastState.gameWon, newHistory);
  }, [moveHistory]);

  const move = useCallback(
    async (direction) => {
      if (gameOver) return false;
      return await moveTiles(direction);
    },
    [gameOver, moveTiles]
  );

  return {
    board,
    score,
    bestScore,
    gameOver,
    gameWon,
    canUndo,
    move,
    resetGame,
    undo,
  };
};
