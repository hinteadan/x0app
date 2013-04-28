/// <reference path="underscore.js" />

(function () {

    function Player(mark, name, playerTurnAction) {

        if (!playerTurnAction || typeof playerTurnAction !== 'function') {
            throw new Error('The player turn action must be provided');
        }

        this.Mark = mark || 'X';
        this.Name = name || 'Untitled Player';
        this.PlayerTurnAction = playerTurnAction;
        this.Score = 0;

        this.AddScorePoint = function(){
            this.Score++;
        }
    }

    function Cell(x, y) {
        this.X = x || 0;
        this.Y = y || 0;
    }

    function GameInfo(size, players, scoreToWin) {

        if (!players || !players.length || players.length < 2) {
            throw new Error('There must at least 2 players at the table');
        }

        this.Size = size || 3;
        this.Players = players;
        this.ScoreToWin = scoreToWin;
        this.PlayerByMark = function(mark){
            return _.find(this.Players, function(p){ return p.Mark === mark; });
        }
    }

    function EventHandler(event, handler) {
        this.Event = event;
        this.Handler = handler;
    }

    function GameEventHandler() {

        var events = {
                NewGame: 'NEW_GAME',
                EndGame: 'END_GAME',
                PlayerTurn: 'PLAYER_TURN',
                CellMarked: 'CELL_MARKED'
            },
            eventHandlers = [];

        function findHandler(handler, event) {
            return _.find(eventHandlers, function (eh) {
                return eh.Event === event && eh.Handler === handler;
            });
        }

        function addEventHandler(handler, event) {
            if (typeof handler != 'function') {
                throw new Error('Event handler must be a func ref');
            }

            if (findHandler(handler, event)) {
                return;
            }

            eventHandlers.push(new EventHandler(event, handler));
        }

        function removeEventHandler(handler, event) {
            
            var handler = findHandler(handler, event);
            if (!handler) {
                return;
            }

            eventHandlers = _.without(eventHandlers, handler);
        }

        function raiseEvent(event, payload){
            _.each(
                _.select(eventHandlers, function(eh){
                    return eh.Event === event
                }),
                function (handler) {
                    setTimeout(handler.Handler, 1, payload);
                }
            );
        }


        this.Events = events;
        this.Add = addEventHandler;
        this.Remove = removeEventHandler;
        this.Raise = raiseEvent;
    }

    function GameBoard(size) {

        function Cell(x, y) {
            this.X = x || 0;
            this.Y = y || 0;
            this.Mark = null;
            this.IsMarked = function () {
                return this.Mark != null;
            }
        }

        var board = [],
            flatBoard = [];

        for (var y = 0; y < size; y++) {
            board.push([]);
            for (var x = 0; x < size; x++) {
                board[y].push(new Cell(x, y));
                flatBoard.push(board[y][x]);
            }
        }

        function isFull() {
            return _.all(board, function (row) {
                return _.all(row, function (cell) {
                    return cell.IsMarked();
                });
            });
        }

        function isWon() {
            return _.any(winnerCells());
        }

        function winnerCells() {
            var winnerCells = [],
                diagonal1 = _.select(flatBoard, function (c) { return c.X === c.Y; }),
                diagonal2 = _.select(flatBoard, function (c) { return c.X === size - c.Y - 1; });

            _(size).times(function (index) {
                if (_.all(board[index], function (c) { return c.IsMarked() && c.Mark === board[index][0].Mark; })) {
                    //Full Row
                    winnerCells = _.union(winnerCells, board[index]);
                }
                if (_.all(board, function (row) { return row[index].IsMarked() && row[index].Mark === board[0][index].Mark; })) {
                    //Full Column
                    winnerCells = _.union(winnerCells, _.select(flatBoard, function (c) { return c.X === index; }));
                }
            });

            if (_.all(diagonal1, function (c) { return c.IsMarked() && c.Mark === diagonal1[0].Mark; })) {
                winnerCells = _.union(winnerCells, diagonal1);
            }

            if (_.all(diagonal2, function (c) { return c.IsMarked() && c.Mark === diagonal2[0].Mark; })) {
                winnerCells = _.union(winnerCells, diagonal2);
            }

            return winnerCells;
        }

        function markCell(x, y, mark) {
            if (board[y][x].IsMarked()) {
                return;
                //throw new Error('The cell is already marked');
            }
            board[y][x].Mark = mark;
        }

        function fetchBoardAsReadonly(){
            return _.map(board, function(row){
                return _.map(row, function(cell){
                    return cell.Mark;
                });
            });
        }

        this.Mark = markCell;
        this.IsCompleted = function () { return isFull() || isWon(); }
        this.HasWinner = isWon;
        this.WinnerCells = winnerCells;
        this.AsReadOnly = fetchBoardAsReadonly;
    }

    function GameEndedArgs(board, hasWinner, winningCells) {
        this.Board = board;
        this.HasWinner = hasWinner;
        this.WinningCells = winningCells;
    }

    function GameCoordinator(gameInfo) {

        var eventHandler = new GameEventHandler(),
            currentBoard = null,
            lastPlayerToStartIndex = _.random(gameInfo.Players.length - 1),
            currentPlayerIndex = lastPlayerToStartIndex,
            gamesPlayed = 0;

        eventHandler.Add(function (endGameInfo) {

            gamesPlayed++;

            if (endGameInfo.HasWinner) {
                gameInfo.PlayerByMark(endGameInfo.WinningCells[0].Mark).AddScorePoint();
            }

            if (_.any(gameInfo.Players, function (p) { return p.Score >= gameInfo.ScoreToWin; })) {
                return;
            }

            startGame();

        }, eventHandler.Events.EndGame);

        function checkAndProcessGameFinish() {
            if (currentBoard.IsCompleted()) {
                endCurrentBoard();
                return;
            }
            playerMakesHisMoveAndPaysItForward(checkAndProcessGameFinish);
        }

        function startGame() {
            currentBoard = new GameBoard(gameInfo.Size);
            eventHandler.Raise(eventHandler.Events.NewGame, currentBoard.AsReadOnly());
            playerMakesHisMoveAndPaysItForward(checkAndProcessGameFinish);
        }

        function playerMakesHisMoveAndPaysItForward(onTurnFinished) {
            var boardAsReadOnly = currentBoard.AsReadOnly(),
                currentPlayer = gameInfo.Players[currentPlayerIndex];

            currentPlayer.PlayerTurnAction.call(boardAsReadOnly, boardAsReadOnly, function (cellToMark) {
                currentBoard.Mark(cellToMark.X, cellToMark.Y, currentPlayer.Mark);
                eventHandler.Raise(eventHandler.Events.CellMarked, currentBoard.AsReadOnly());
                currentPlayerIndex = currentPlayerIndex + 1 >= gameInfo.Players.length ? 0 : currentPlayerIndex + 1;
                onTurnFinished.call();
            });
        }

        function endCurrentBoard() {
            lastPlayerToStartIndex = lastPlayerToStartIndex + 1 >= gameInfo.Players.length ? 0 : lastPlayerToStartIndex + 1;
            currentPlayerIndex = lastPlayerToStartIndex;
            eventHandler.Raise(eventHandler.Events.EndGame, new GameEndedArgs(currentBoard.AsReadOnly(), currentBoard.HasWinner(), currentBoard.WinnerCells()));
        }

        function playGame(){
            startGame();
        }

        this.Play = playGame;
        this.Events = {
            AddGameEndedHandler: function (handler) { eventHandler.Add(handler, eventHandler.Events.EndGame); },
            RemoveGameEndedHandler: function (handler) { eventHandler.Remove(handler, eventHandler.Events.EndGame); },
            AddCellMarkedHandler: function (handler) { eventHandler.Add(handler, eventHandler.Events.CellMarked); },
            RemoveCellMarkedHandler: function (handler) { eventHandler.Remove(handler, eventHandler.Events.CellMarked); },
            AddNewGameHandler: function (handler) { eventHandler.Add(handler, eventHandler.Events.NewGame); },
            RemoveNewGameHandler: function (handler) { eventHandler.Remove(handler, eventHandler.Events.NewGame); }
        };
    }

    this.X0App = {
        Player: Player,
        GameInfo: GameInfo,
        GameCoordinator: GameCoordinator,
        Advanced: {
            Board: GameBoard,
            Cell: Cell
        }
    };

}).call(this);