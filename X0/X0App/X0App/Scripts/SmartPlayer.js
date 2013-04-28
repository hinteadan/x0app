/// <reference path="underscore.js" />
/// <reference path="X0App.js" />

(function () {

    function dummyPlayerTurnAction(board, notifyMark) {
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

    this.SmartPlayer = {
        TurnAction: dummyPlayerTurnAction
    }

}).call(this);