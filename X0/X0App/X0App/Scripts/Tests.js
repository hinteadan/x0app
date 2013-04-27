/// <reference path="underscore.js" />
/// <reference path="qunit.js" />
/// <reference path="X0App.js" />

(function () {

    module("Game Board");

    test("Win Condition", function () {
        
        var board = new X0App.Advanced.Board(3);

        ok(!board.HasWinner());

        board.Mark(0, 0, 'X');
        ok(!board.HasWinner());
        board.Mark(1, 0, 'X');
        ok(!board.HasWinner());
        board.Mark(2, 0, 'X');
        ok(board.HasWinner());
        ok(_.all(board.WinnerCells(), function (c) { return c.Y === 0; }));

    });

}).call(this);