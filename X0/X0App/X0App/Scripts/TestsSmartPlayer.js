/// <reference path="underscore.js" />
/// <reference path="qunit.js" />
/// <reference path="X0App.js" />
/// <reference path="SmartPlayer.js" />

(function () {

    function cellToMark(board, ownMark) {
        var size = board.length,
            corners = [
                new X0App.Advanced.Cell(0, 0),
                new X0App.Advanced.Cell(size - 1, 0),
                new X0App.Advanced.Cell(size - 1, size - 1),
                new X0App.Advanced.Cell(0, size - 1)
            ];
            opponentMarkCell = null;

        _.each(board, function (row, rowIndex) {
            if (opponentMarkCell) {
                return;
            }
            _.each(row, function (cell, cellIndex) {
                if (opponentMarkCell) {
                    return;
                }
                if (cell != null && cell !== ownMark) {
                    opponentMarkCell = new X0App.Advanced.Cell(cellIndex, rowIndex);
                }
            });
        });

        if (!opponentMarkCell) {

        }

        return !opponentMarkCell 
            ? corners[_.random(3)]
            : new X0App.Advanced.Cell(Math.abs(size - opponentMarkCell.X - 1), Math.abs(size - opponentMarkCell.Y - 1))
        ;
    }

    module("Smart Player");

    test("First Move on 3x3", function () {
        var board = [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ],
            c = cellToMark(board, 'X');

        ok((c.X == 0 && c.Y == 0)
            || (c.X == 2 && c.Y == 0)
            || (c.X == 2 && c.Y == 2)
            || (c.X == 0 && c.Y == 2));
    });

    test("Second Move on 3x3", function () {
        var board = [
            ['X', null, null],
            [null, null, null],
            [null, null, null]
        ],
            c = cellToMark(board, '0');
        ok(c.X == 2 && c.Y == 2);

        board = [
            [null, null, 'X'],
            [null, null, null],
            [null, null, null]
        ];
        c = cellToMark(board, '0');
        ok(c.X == 0 && c.Y == 2);

        board = [
            [null, null, null],
            [null, null, null],
            [null, null, 'X']
        ];
        c = cellToMark(board, '0');
        ok(c.X == 0 && c.Y == 0);

        board = [
            [null, null, null],
            [null, null, null],
            ['X', null, null]
        ];
        c = cellToMark(board, '0');
        ok(c.X == 2 && c.Y == 0);
    });

    test("Third Move on 3x3", function () {
        var board = [
                ['X', null, 'X'],
                [null, null, null],
                [null, null, '0']
            ],
            c = cellToMark(board, '0');
        ok(c.X == 1 && c.Y == 0);

        board = [
            ['X', 'X', null],
            [null, null, null],
            [null, null, '0']
        ];
        c = cellToMark(board, '0');
        ok(c.X == 0 && c.Y == 2);

        board = [
            ['X', null, null],
            [null, null, null],
            ['X', null, '0']
        ];
        c = cellToMark(board, '0');
        ok(c.X == 0 && c.Y == 1);

        board = [
            ['X', null, null],
            ['X', null, null],
            [null, null, '0']
        ];
        c = cellToMark(board, '0');
        ok(c.X == 0 && c.Y == 2);

        board = [
            ['X', null, null],
            [null, 'X', null],
            [null, null, '0']
        ];
        c = cellToMark(board, '0');
        ok((c.X == 0 && c.Y == 2) || (c.X == 2 && c.Y == 0));

        board = [
            ['X', null, null],
            [null, null, null],
            [null, 'X', '0']
        ];
        c = cellToMark(board, '0');
        ok((c.X == 2 && c.Y == 1) || (c.X == 2 && c.Y == 0));

        board = [
            ['X', null, null],
            [null, null, 'X'],
            [null, null, '0']
        ];
        c = cellToMark(board, '0');
        ok((c.X == 0 && c.Y == 2) || (c.X == 1 && c.Y == 2));
    })

}).call(this);