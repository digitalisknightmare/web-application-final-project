const board = document.getElementById('gameboard');
const gameStatus = document.getElementById('gamestatus');
const restartButton = document.getElementById('restart-button');
const rowsize = 8;
const colsize = 8;
let selectedPiece = null;
let currentPlayer = 'red';
let redPieces = 12;
let blackPieces = 12;
let isMultiCapture = false;

function createBoard() {
    board.innerHTML = '';
    for (let row=0; row < rowsize; row++) {
        for (let col = 0; col < colsize; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row+col) % 2 === 0 ? 'white' : 'black');
            square.dataset.row = row;
            square.dataset.col = col;
            board.appendChild(square);

            if ((row + col) % 2 !== 0 && (row < 3 || row > 4)) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.classList.add(row < 3 ? 'black' : 'red');
                piece.dataset.row = row;
                piece.dataset.col = col;

                square.appendChild(piece);
            }

            square.addEventListener('click', handleSquareClick);
        }
    }
}

function handleSquareClick(e) {
    const square = e.target.classList.contains('square') ? e.target : e.target.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece) {
        if (selectedPiece === square.firstChild) {
            selectedPiece.classList.remove('selected');
            selectedPiece = null;
        } else if (!square.firstChild && isValidMode(selectedPiece, row, col)) {
            movePiece(selectedPiece, row, col);
        }
    } else if (square.firstChild && square.firstChild.classList.contains('piece')
    && square.firstChild.classList.contains(currentPlayer)) {
        selectPiece(square.firstChild);
    }
}

// Allows the player to choose a piece, as well as unchoose it.
function selectPiece(piece) {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected'); //
    }
    piece.classList.add('selected');
    selectedPiece = piece;
}

function isValidMode(piece, row, col) {
    const oldRow = parseInt(piece.dataset.row);
    const oldCol = parseInt(piece.dataset.col);
    const moveRow = row - oldRow;
    const moveCol = col - oldCol;

    const captureMoves = getAvailableCaptures(currentPlayer);
    const isCapture = Math.abs(moveRow) === 2 && Math.abs(moveCol) ===2;

    if (captureMoves.length > 0 && !isCapture) {
        return false;
    }

    if (!piece.classList.contains('king')) {
        if ((currentPlayer === 'red' && moveRow > 0) || (currentPlayer === 'black' && moveRow < 0)) {
            return false;
        }
    }

    if (isCapture) {
        const middleRow = oldRow + moveRow / 2;
        const middleCol = oldCol + moveCol / 2;
        const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
        if (middleSquare.firstChild && middleSquare.firstChild.classList.contains('piece')
        && !middleSquare.firstChild.classList.contains(currentPlayer)) {
            return true;
        }
    } else if (Math.abs(moveRow) === 1 && Math.abs(moveCol) === 1) {
        return true;
    }
    return false;
}

function movePiece(piece,row,col) {
    const oldRow = parseInt(piece.dataset.row);
    const oldCol = parseInt(piece.dataset.col);
    const targetSquare = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    const moveRow = row - oldRow;
    const moveCol = col - oldCol;

    const isCapture = Math.abs(moveRow) === 2 && Math.abs(moveCol) === 2;
    if (isCapture) {
        const middleRow = oldRow + moveRow / 2;
        const middleCol = oldCol + moveCol / 2;
        const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
        if (middleSquare.firstChild&& middleSquare.firstChild.classList.contains('piece')
        && !middleSquare.firstChild.classList.contains(currentPlayer)) {
            middleSquare.removeChild(middleSquare.firstChild);
            currentPlayer === 'red' ? blackPieces-- : redPieces--;
            preformMove(piece, targetSquare, row, col);

            const furtherCaptures = getAvailableCapturesForPiece(piece);
            if (furtherCaptures.length > 0) {
                isMultiCapture = true;
                selectPiece(piece);
                return;
            } else {
                isMultiCapture = false;
            }
        }
    } else {
        // Handle move normally. No capture.
        preformMove(piece, targetSquare, row, col);
    }
    endTurn();
}

function preformMove(piece, targetSquare, row, col) {
    targetSquare.appendChild(piece);
    piece.dataset.row = row;
    piece.dataset.col = col;
    piece.classList.remove('selected');
    selectedPiece = null;

    if (((row === 0) && currentPlayer === 'red') || (row === 7 && currentPlayer === 'black')) {
        piece.classList.add('king');
    }

    checkWinCondition();
}

function getAvailableCaptures(player) {
    let captures = [];
    const piece = document.querySelectorAll(`.piece.${player}`);
    piece.forEach(piece => {
        captures = captures.concat(getAvailableCapturesForPiece(piece));
    });
    return captures;
}

function getAvailableCapturesForPiece(piece) {
    const row = parseInt(piece.dataset.row);
    const col = parseInt(piece.dataset.col);
    const directions = [
        {rowDir: 1, colDir: 1},
        {rowDir: 1, colDir: -1},
        {rowDir:-1, colDir: -1},
        {rowDir: -1, colDir: 1}
    ];
    const captures = [];
    directions.forEach(direction => {
        const targetRow = row + 2 * direction.rowDir;
        const targetCol = col + 2 * direction.colDir;
        const middleRow = row + direction.rowDir;
        const middleCol = col + direction.colDir;
        const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);
        const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
        if (targetSquare && middleSquare && !targetSquare.firstChild && middleSquare.firstChild
            && middleSquare.firstChild.classList.contains('piece') && !middleSquare.firstChild.classList.contains(currentPlayer)) {
                captures.push({piece, targetRow, targetCol});
        }
        
    });
    return captures;
}

function checkWinCondition() {
    if (redPieces === 0) {
        gameStatus.innerText = "Black wins!";
        endGame();
        return true;
    } else if (blackPieces === 0 ) {
        gameStatus.innerText = "Red Wins!";
        endGame();
        return true;
    }
    return false;
}

function endTurn() {
    currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
    updateGameStatus();
}

function updateGameStatus() {
    gameStatus.innerText = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
}

function endGame() {
    restartButton.style.display = 'block';
    board.style.pointerEvents = 'none';
}

function restartGame() {
    redPieces = 12;
    blackPieces = 12;
    selectedPiece = null;
    currentPlayer = 'red';
    gameStatus.innerText = '';
    restartButton.style.display = 'none';
    board.style.pointerEvents = 'auto';
    createBoard();
    updateGameStatus();
    isMultiCapture = false;
}

restartButton.addEventListener('click', restartGame);

createBoard();
updateGameStatus();