/// <reference path="underscore.js" />
/// <reference path="qunit.js" />
/// <reference path="X0App.js" />
/// <reference path="SmartPlayer.js" />
/// <reference path="RandomCellPlayer.js" />

(function () {

    var x = 'X',
        o = '0',
        //smartPlayer = new SmartPlayer.Player();
        smartPlayer = new RandomCellPlayer.Player();

    function cellToMark(board, ownMark) {
        return smartPlayer.CellToMark(board, ownMark);
    }

    module("Smart Player");

    test("First Move on 3x3", function () {
        var board = [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ],
            c = cellToMark(board, x);

        ok((c.X == 0 && c.Y == 0)
            || (c.X == 2 && c.Y == 0)
            || (c.X == 2 && c.Y == 2)
            || (c.X == 0 && c.Y == 2));
    });

    test("Second Move on 3x3", function () {
        var board = [
            [x, null, null],
            [null, null, null],
            [null, null, null]
        ],
            c = cellToMark(board, o);
        ok((c.X == 1 && c.Y == 2) || (c.X == 2 && c.Y == 1));

        board = [
            [null, null, x],
            [null, null, null],
            [null, null, null]
        ];
        c = cellToMark(board, o);
        ok((c.X == 0 && c.Y == 1) || (c.X == 1 && c.Y == 2));

        board = [
            [null, null, null],
            [null, null, null],
            [null, null, x]
        ];
        c = cellToMark(board, o);
        ok((c.X == 1 && c.Y == 0) || (c.X == 0 && c.Y == 1));

        board = [
            [null, null, null],
            [null, null, null],
            [x, null, null]
        ];
        c = cellToMark(board, o);
        ok((c.X == 1 && c.Y == 0) || (c.X == 2 && c.Y == 1));
    });

    test("Third Move on 3x3", function () {
        var board = [
                [x, null, x],
                [null, null, null],
                [null, null, o]
        ],
            c = cellToMark(board, o);
        ok(c.X == 1 && c.Y == 0);

        board = [
            [x, x, null],
            [null, null, null],
            [null, null, o]
        ];
        c = cellToMark(board, o);
        ok(c.X == 2 && c.Y == 0);

        board = [
            [x, null, null],
            [null, null, null],
            [x, null, o]
        ];
        c = cellToMark(board, o);
        ok(c.X == 0 && c.Y == 1);

        board = [
            [x, null, null],
            [x, null, null],
            [null, null, o]
        ];
        c = cellToMark(board, o);
        ok(c.X == 0 && c.Y == 2);

        board = [
            [x, null, null],
            [null, x, null],
            [null, null, o]
        ];
        c = cellToMark(board, o);
        ok((c.X == 0 && c.Y == 2) || (c.X == 2 && c.Y == 0));

        board = [
            [x, null, null],
            [null, null, null],
            [null, x, o]
        ];
        c = cellToMark(board, o);
        ok((c.X == 2 && c.Y == 1) || (c.X == 2 && c.Y == 0));

        board = [
            [x, null, null],
            [null, null, x],
            [null, null, o]
        ];
        c = cellToMark(board, o);
        ok((c.X == 0 && c.Y == 2) || (c.X == 1 && c.Y == 2));
    });

    test("Fourth Move on 3x3", function () {
        var board = [
                [x, o, x],
                [x, null, null],
                [null, null, o]
        ],
            c = cellToMark(board, o);
        ok(c.X == 0 && c.Y == 2);

        board = [
            [x, o, x],
            [null, x, null],
            [null, null, o]
        ];
        c = cellToMark(board, o);
        ok(c.X == 0 && c.Y == 2);
    });

    test("Winning position", function () {
        var board = [
                [x, null, null],
                [null, o, o],
                [null, x, x]
        ],
            c = cellToMark(board, o);
        ok(c.X == 0 && c.Y == 1);
    });

}).call(this);