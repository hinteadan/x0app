/// <reference path="underscore.js" />
/// <reference path="qunit.js" />
/// <reference path="X0App.js" />

(function () {

    module("Game Board");

    test("Win Condition", function () {
        
        var board = new X0App.Advanced.Board(3);

        ok(!board.HasWinner());

        board.Mark(0, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(2, 1, 'X');
        ok(board.HasWinner());
        ok(_.all(board.WinnerCells(), function (c) { return c.Y === 1; }));

    });

    test("Win Full Row", function () {
        var board = new X0App.Advanced.Board(3);

        ok(!board.HasWinner());

        board.Mark(0, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(2, 1, 'X');
        ok(board.HasWinner());
        ok(_.all(board.WinnerCells(), function (c) { return c.Y === 1; }));
    });

    test("Win Full Column", function () {
        var board = new X0App.Advanced.Board(3);

        ok(!board.HasWinner());

        board.Mark(1, 0, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 2, 'X');
        ok(board.HasWinner());
        ok(_.all(board.WinnerCells(), function (c) { return c.X === 1; }));
    });

    test("Win Diagonal 1", function () {
        var board = new X0App.Advanced.Board(3);

        ok(!board.HasWinner());

        board.Mark(0, 0, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(2, 2, 'X');
        ok(board.HasWinner());
        ok(_.all(board.WinnerCells(), function (c) { return c.X === c.Y; }));
    });

    test("Win Diagonal 2", function () {
        var board = new X0App.Advanced.Board(3);

        ok(!board.HasWinner());

        board.Mark(0, 2, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 1, 'X');
        ok(!board.HasWinner());
        board.Mark(2, 0, 'X');
        ok(board.HasWinner());
        ok(_.all(board.WinnerCells(), function (c) { return c.X === 3 - c.Y - 1; }));
    });

}).call(this);