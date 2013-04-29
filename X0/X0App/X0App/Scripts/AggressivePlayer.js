/// <reference path="underscore.js" />
/// <reference path="X0App.js" />

(function () {

    function AggressivePlayer() {

        function fetchCellsBy(board, comparer) {
            var cells = [];
            _.each(board, function (row, rowIndex) {
                _.each(row, function (cell, cellIndex) {
                    if (comparer(cell)) {
                        cells.push(new X0App.Advanced.Cell(cellIndex, rowIndex));
                    }
                });
            });
            return cells;
        }

        function fetchOpponentCells(board, ownMark) {
            return fetchCellsBy(board, function (c) {
                return c != null && c !== ownMark;
            });
        }

        function fetchOwnCells(board, ownMark) {
            return fetchCellsBy(board, function (c) {
                return c === ownMark;
            });
        }

        function fetchFreeCells(board) {
            return fetchCellsBy(board, function (c) {
                return c === null;
            });
        }

        function checkForRowsOrColumnsAboutToComplete(board, ownCells, opponentCells) {
            var size = board.length,
                opponentRowIndexAboutToComplete = -1,
                opponentColumnIndexAboutToComplete = -1,
                ownRowIndexAboutToComplete = -1,
                ownColumnIndexAboutToComplete = -1;

            _(size).times(function (index) {
                var opponentCellsInRow = _(opponentCells).where({ Y: index }),
                    opponentCellsInColumn = _(opponentCells).where({ X: index }),
                    ownCellsInRow = _(ownCells).where({ Y: index }),
                    ownCellsInColumn = _(ownCells).where({ X: index });

                opponentRowIndexAboutToComplete = !_(ownCells).where({ Y: index }).length && opponentCellsInRow.length === size - 1
                    ? index
                    : opponentRowIndexAboutToComplete;
                opponentColumnIndexAboutToComplete = !_(ownCells).where({ X: index }).length && opponentCellsInColumn.length === size - 1
                    ? index
                    : opponentColumnIndexAboutToComplete;
                ownRowIndexAboutToComplete = !_(opponentCells).where({ Y: index }).length && ownCellsInRow.length === size - 1
                    ? index
                    : ownRowIndexAboutToComplete;
                ownColumnIndexAboutToComplete = !_(opponentCells).where({ X: index }).length && ownCellsInColumn.length === size - 1
                    ? index
                    : ownColumnIndexAboutToComplete;
            });

            if (ownRowIndexAboutToComplete >= 0) {
                var index = -1;
                _(board[ownRowIndexAboutToComplete]).each(function (cell, cellIndex) {
                    if (cell === null) {
                        index = cellIndex;
                    }
                });
                return new X0App.Advanced.Cell(index, ownRowIndexAboutToComplete);
            }
            if (ownColumnIndexAboutToComplete >= 0) {
                var index = -1;
                _(board).each(function (row, rowIndex) {
                    if (row[ownColumnIndexAboutToComplete] === null) {
                        index = rowIndex;
                    }
                });
                return new X0App.Advanced.Cell(ownColumnIndexAboutToComplete, index);
            }

            if (opponentRowIndexAboutToComplete >= 0) {
                var index = -1;
                _(board[opponentRowIndexAboutToComplete]).each(function (cell, cellIndex) {
                    if (cell === null) {
                        index = cellIndex;
                    }
                });
                return new X0App.Advanced.Cell(index, opponentRowIndexAboutToComplete);
            }

            if (opponentColumnIndexAboutToComplete >= 0) {
                var index = -1;
                _(board).each(function (row, rowIndex) {
                    if (row[opponentColumnIndexAboutToComplete] === null) {
                        index = rowIndex;
                    }
                });
                return new X0App.Advanced.Cell(opponentColumnIndexAboutToComplete, index);
            }

            return false;
        }

        function checkForDiagonalsAboutToComplete(board, ownCells, opponentCells) {
            var size = board.length,
                opponentCellsOnMainDiagonal = _(opponentCells).select(function (c) { return c.X === c.Y; }),
                opponentCellsOnSecondDiagonal = _(opponentCells).select(function (c) { return c.X === size - c.Y - 1; }),
                cellToReturn = null;

            if (opponentCellsOnMainDiagonal.length === size - 1) {
                _(size).times(function (index) {
                    if (cellToReturn != null) { return; }
                    if (board[index][index] === null) {
                        cellToReturn = new X0App.Advanced.Cell(index, index);
                    }
                });
            }

            if (cellToReturn === null && opponentCellsOnSecondDiagonal.length === size - 1) {
                _(size).times(function (index) {
                    if (cellToReturn != null) { return; }
                    if (board[size - index - 1][index] === null) {
                        cellToReturn = new X0App.Advanced.Cell(index, size - index - 1);
                    }
                });
            }

            return cellToReturn ? cellToReturn : false;
        }

        function checkForRowsOrColumnsToAdvance(board, ownCells, opponentCells) {
            var cellToAdvance = null,
                size = board.length;
            _(ownCells).each(function (ownCell) {
                var opponentCellsOnSameRow = _(opponentCells).where({ Y: ownCell.Y }),
                    opponentCellsOnSameColumn = _(opponentCells).where({ X: ownCell.X });

                if (!_.any(opponentCellsOnSameRow)) {
                    cellToAdvance = new X0App.Advanced.Cell(ownCell.X === 0 ? size - 1 : 0, ownCell.Y);
                }

                if (!_.any(opponentCellsOnSameColumn)) {
                    cellToAdvance = new X0App.Advanced.Cell(ownCell.X, ownCell.Y === 0 ? size - 1 : 0);
                }
            });
            return cellToAdvance ? cellToAdvance : false;
        }

        function checkForDiagonalsToAdvance(board, ownCells, opponentCells) {
            var size = board.length,
                freeCells = fetchFreeCells(board),
                freeCellsOnMainDiagonal = _(freeCells).select(function (c) { return c.X === c.Y; }),
                freeCellsOnSecondDiagonal = _(freeCells).select(function (c) { return c.X === size - c.Y - 1; }),
                opponentCellsOnMainDiagonal = _(opponentCells).select(function (c) { return c.X === c.Y; }),
                opponentCellsOnSecondDiagonal = _(opponentCells).select(function (c) { return c.X === size - c.Y - 1; });

            if (!_(opponentCellsOnMainDiagonal).any()) {
                return freeCellsOnMainDiagonal[_.random(freeCellsOnMainDiagonal.length - 1)];
            }
            if (!_(opponentCellsOnSecondDiagonal).any()) {
                return freeCellsOnSecondDiagonal[_.random(freeCellsOnSecondDiagonal.length - 1)];
            }

            return false;
        }

        function cellToMark(board, ownMark) {

            var opponentCells = fetchOpponentCells(board, ownMark),
                ownCells = fetchOwnCells(board, ownMark),
                freeCells = fetchFreeCells(board),
                cellToPreventImmediateLossOrToWin = checkForRowsOrColumnsAboutToComplete(board, ownCells, opponentCells)
                    || checkForDiagonalsAboutToComplete(board, ownCells, opponentCells),
                cellToAdvance = checkForRowsOrColumnsToAdvance(board, ownCells, opponentCells)
                    || checkForDiagonalsToAdvance(board, ownCells, opponentCells);

            return cellToPreventImmediateLossOrToWin 
                ? cellToPreventImmediateLossOrToWin
                : cellToAdvance 
                    ? cellToAdvance
                    : freeCells[_.random(freeCells.length - 1)];
        }

        function turnAction(board, ownMark, notifyMark) {
            notifyMark.call(this, cellToMark(board, ownMark));
        }

        this.TurnAction = turnAction;
        this.CellToMark = cellToMark;
    }

    this.AggressivePlayer = {
        Player: AggressivePlayer,
        TurnAction: new AggressivePlayer().TurnAction
    };

}).call(this);