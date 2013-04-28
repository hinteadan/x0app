/// <reference path="underscore.js" />
/// <reference path="X0App.js" />

(function () {

    function dummyPlayerTurnAction(board, ownMark, notifyMark) {
        var firstNonMarkedCell = null;

        _.each(board, function (row, rowIndex) {
            if (firstNonMarkedCell) {
                return;
            }
            _.each(row, function (cell, cellIndex) {
                if (firstNonMarkedCell || board[rowIndex][cellIndex] !== null) {
                    return;
                }

                firstNonMarkedCell = new X0App.Advanced.Cell(cellIndex, rowIndex);
            });
        });

        notifyMark.call(firstNonMarkedCell, firstNonMarkedCell);
    }

    function SmartPlayer() {
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

        function fetchCornerCells(boardSize) {
            return [
                new X0App.Advanced.Cell(0, 0),
                new X0App.Advanced.Cell(boardSize - 1, 0),
                new X0App.Advanced.Cell(boardSize - 1, boardSize - 1),
                new X0App.Advanced.Cell(0, boardSize - 1)
            ];
        }

        function cellToMark(board, ownMark) {
            var size = board.length,
                corners = fetchCornerCells(),
                opponentCells = fetchOpponentCells(board, ownMark),
                ownCells = fetchOwnCells(board, ownMark),
                isFirstMove = !_.any(opponentCells),
                cellToPreventImmediateLossOrToWin = checkForRowsOrColumnsAboutToComplete(board, ownCells, opponentCells),
                cellToAdvance = checkForRowsOrColumnsToAdvance(board, ownCells, opponentCells);

            if (cellToPreventImmediateLossOrToWin) {
                return cellToPreventImmediateLossOrToWin;
            }

            if (cellToAdvance) {
                return cellToAdvance;
            }

            return isFirstMove
                ? corners[_.random(3)]
                : new X0App.Advanced.Cell(Math.abs(size - opponentCells[0].X - 1), Math.abs(size - opponentCells[0].Y - 2))
            ;
        }

        function turnAction(board, ownMark, notifyMark) {
            notifyMark.call(this, cellToMark(board, ownMark));
        }

        this.TurnAction = turnAction;
        this.CellToMark = cellToMark;
    }

    this.SmartPlayer = {
        Player: SmartPlayer,
        TurnAction: new SmartPlayer().TurnAction
    }

}).call(this);