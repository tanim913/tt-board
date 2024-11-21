let leftScore = 0;
let rightScore = 0;
let leftVictoryCount = 0;
let rightVictoryCount = 0;
let matchCount = 0; // Tracks completed matches
let history = [];
let redoStack = [];
let inDeuce = false;
let advantage = null;
let isModalVisible = false;
let leftServing = true;

const leftScoreElement = document.getElementById('leftScore');
const rightScoreElement = document.getElementById('rightScore');
const leftServeStatus = document.getElementById('leftServeStatus');
const rightServeStatus = document.getElementById('rightServeStatus');
const switchServeButton = document.getElementById('switchServeButton');
const resetCurrentScore = document.getElementById('resetBtn');
const winModal = document.getElementById('winModal');
const modalMessage = document.getElementById('modalMessage');
const modalCloseButton = document.getElementById('modalCloseButton');
const leftPlayerNameInput = document.getElementById('leftPlayerName');
const rightPlayerNameInput = document.getElementById('rightPlayerName');
const leftVictoryCountElement = document.getElementById('leftPlayerVictoryCount');
const rightVictoryCountElement = document.getElementById('rightPlayerVictoryCount');

// Make the victory count fields read-only
leftVictoryCountElement.readOnly = true;
rightVictoryCountElement.readOnly = true;

function updateScore() {
    leftScoreElement.textContent = leftScore;
    rightScoreElement.textContent = rightScore;
    updateServingIndicator();
}

function updateVictoryCount() {
    leftVictoryCountElement.value = leftVictoryCount;
    rightVictoryCountElement.value = rightVictoryCount;
}

function switchServe() {
    leftServing = !leftServing;
    updateServingIndicator(); 
}

switchServeButton.addEventListener('click', switchServe);
resetCurrentScore.addEventListener('click', resetBoard);

function updateServingIndicator() {
    const totalPoints = leftScore + rightScore;
    const leftTTIcon = document.getElementById('left-tt-icon');
    const rightTTIcon = document.getElementById('right-tt-icon');
    const isDeuce = leftScore >= 10 && rightScore >= 10;

    if (isDeuce) {
        if (totalPoints % 2 === 0) {
            leftServeStatus.textContent = 'Serving';
            rightServeStatus.textContent = 'Not Serving';
            leftTTIcon.classList.remove('d-none');
            rightTTIcon.classList.add('d-none');
        } else {
            leftServeStatus.textContent = 'Not Serving';
            rightServeStatus.textContent = 'Serving';
            leftTTIcon.classList.add('d-none');
            rightTTIcon.classList.remove('d-none');
        }
    } else {
        if (totalPoints < 2) {
            if (leftServing) {
                leftServeStatus.textContent = 'Serving';
                rightServeStatus.textContent = 'Not Serving';
                leftTTIcon.classList.remove('d-none');
                rightTTIcon.classList.add('d-none');
            } else {
                leftServeStatus.textContent = 'Not Serving';
                rightServeStatus.textContent = 'Serving';
                leftTTIcon.classList.add('d-none');
                rightTTIcon.classList.remove('d-none');
            }
        } else {
            const pointsSinceStart = totalPoints - (totalPoints % 2);
            const shouldLeftServe = (pointsSinceStart / 2) % 2 === 0;

            if (leftServing) {
                if (shouldLeftServe) {
                    leftServeStatus.textContent = 'Serving';
                    rightServeStatus.textContent = 'Not Serving';
                    leftTTIcon.classList.remove('d-none');
                    rightTTIcon.classList.add('d-none');
                } else {
                    leftServeStatus.textContent = 'Not Serving';
                    rightServeStatus.textContent = 'Serving';
                    leftTTIcon.classList.add('d-none');
                    rightTTIcon.classList.remove('d-none');
                }
            } else {
                if (!shouldLeftServe) {
                    leftServeStatus.textContent = 'Serving';
                    rightServeStatus.textContent = 'Not Serving';
                    leftTTIcon.classList.remove('d-none');
                    rightTTIcon.classList.add('d-none');
                } else {
                    leftServeStatus.textContent = 'Not Serving';
                    rightServeStatus.textContent = 'Serving';
                    leftTTIcon.classList.add('d-none');
                    rightTTIcon.classList.remove('d-none');
                }
            }
        }
    }
}

function checkWinCondition() {
    if (leftScore >= 11 && leftScore - rightScore >= 2) {
        leftVictoryCount++;
        matchCount++;
        updateVictoryCount();
        updatePlayerNames(); // This will switch both names and victory counts
        resetBoard();
    } else if (rightScore >= 11 && rightScore - leftScore >= 2) {
        rightVictoryCount++;
        matchCount++;
        updateVictoryCount();
        updatePlayerNames(); // This will switch both names and victory counts
        resetBoard();
    } else if (leftScore === 10 && rightScore === 10) {
        inDeuce = true;
        advantage = null;
    }

    if (matchCount === 3) {
        declareOverallWinner();
    }
}

function declareOverallWinner() {
    let winnerMessage;
    if (leftVictoryCount > rightVictoryCount) {
        const winnerName = leftPlayerNameInput.value || "Left player";
        winnerMessage = `${winnerName} has won the game on ${leftVictoryCount}-${rightVictoryCount}`;
    } else {
        const winnerName = rightPlayerNameInput.value || "Right player";
        winnerMessage = `${winnerName} has won the game on ${rightVictoryCount}-${leftVictoryCount}`;
    }
    showWinModal(winnerMessage);

    // Reset for a new series
    leftVictoryCount = 0;
    rightVictoryCount = 0;
    matchCount = 0;
    updateVictoryCount();
}

function showWinModal(message) {
    modalMessage.textContent = message;
    winModal.style.display = "block";
    isModalVisible = true;
}

function closeWinModal() {
    winModal.style.display = "none";
    isModalVisible = false;
    leftPlayerNameInput.value = "";
    rightPlayerNameInput.value = "";
}

modalCloseButton.addEventListener("click", closeWinModal);

function resetBoard() {
    leftScore = 0;
    rightScore = 0;
    inDeuce = false;
    advantage = null;
    history = [];
    redoStack = [];
    leftServing = true;
    updateScore();
}

function updatePlayerNames() {
    // Swap player names
    const tempName = leftPlayerNameInput.value;
    leftPlayerNameInput.value = rightPlayerNameInput.value;
    rightPlayerNameInput.value = tempName;

    // Swap victory counts after each match
    const tempVictoryCount = leftVictoryCount;
    leftVictoryCount = rightVictoryCount;
    rightVictoryCount = tempVictoryCount;
    updateVictoryCount();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        addPoint('left');
    } else if (e.key === 'ArrowRight') {
        addPoint('right');
    } else if (e.ctrlKey && e.key === 'z') {
        undo();
    } else if (e.ctrlKey && e.key === 'y') {
        redo();
    }
});

function addPoint(player) {
    if (isModalVisible) {
        return;
    }
    history.push({ left: leftScore, right: rightScore });
    redoStack = [];

    if (player === 'left') {
        leftScore++;
    } else if (player === 'right') {
        rightScore++;
    }

    if (inDeuce) {
        handleDeuceLogic();
    }

    updateScore();
    checkWinCondition();
}

function handleDeuceLogic() {
    if (leftScore >= 10 && rightScore >= 10) {
        if (leftScore === rightScore) {
            advantage = null;
        } else if (leftScore > rightScore) {
            advantage = 'left';
        } else {
            advantage = 'right';
        }

        if (advantage === 'left' && leftScore - rightScore >= 2) {
            leftVictoryCount++;
            matchCount++;
            updateVictoryCount();
            updatePlayerNames(); // This will switch both names and victory counts
            resetBoard();
        } else if (advantage === 'right' && rightScore - leftScore >= 2) {
            rightVictoryCount++;
            matchCount++;
            updateVictoryCount();
            updatePlayerNames(); // This will switch both names and victory counts
            resetBoard();
        }
    }
}

function undo() {
    if (history.length > 0) {
        const lastState = history.pop();
        redoStack.push({ left: leftScore, right: rightScore });
        leftScore = lastState.left;
        rightScore = lastState.right;
        updateScore();
    }
}

function redo() {
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();
        history.push({ left: leftScore, right: rightScore });
        leftScore = nextState.left;
        rightScore = nextState.right;
        updateScore();
    }
}
