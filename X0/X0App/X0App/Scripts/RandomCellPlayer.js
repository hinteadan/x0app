/// <reference path="underscore.js" />
/// <reference path="X0App.js" />

(function () {

    function RandomCellPlayer() {

        function cellToMark(board, ownMark) {
            var freeCells = [];
            _.each(board, function (row, rowIndex) {
                _.each(row, function (cell, cellIndex) {
                    if (cell === null) {
                        freeCells.push(new X0App.Advanced.Cell(cellIndex, rowIndex));
                    }
                });
            });
            return freeCells[_.random(freeCells.length - 1)];
        }

        function turnAction(board, ownMark, notifyMark) {
            notifyMark.call(this, cellToMark(board, ownMark));
        }

        this.TurnAction = turnAction;
        this.CellToMark = cellToMark;
    }

    this.RandomCellPlayer = {
        Player: RandomCellPlayer,
        TurnAction: new RandomCellPlayer().TurnAction
    };

}).call(this);