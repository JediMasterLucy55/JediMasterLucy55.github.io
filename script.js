var board;
var score = 0;
var rows = 4;
var columns = 4;
let touchStartX = 0;
let touchStartY = 0;

window.onload = function() {
    setGame();
}

function setGame() {
    // board = [
    //     [2, 2, 2, 2],
    //     [2, 2, 2, 2],
    //     [4, 4, 8, 8],
    //     [4, 4, 8, 8]
    // ];

    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
    //create 2 to begin the game
    setTwo();
    setTwo();
}

function updateTile(tile, num, r, c) {
    tile.innerText = "";
    tile.classList.value = ""; //clear the classList
    tile.classList.add("tile");
    if (num > 0) {
        tile.innerText = num.toString();
        if (num <= 4096) {
            tile.classList.add("x"+num.toString());
        } else {
            tile.classList.add("x8192");
        }                
    }
  tile.innerText = num > 0 ? num : "";
  tile.style.transform = `translate(${c*1}px, ${r*1}px)`; // smooth slide
}

document.addEventListener('keyup', (e) => {
    if (e.code == "ArrowLeft") {
        slideLeft();
        setTwo();
    }
    else if (e.code == "ArrowRight") {
        slideRight();
        setTwo();
    }
    else if (e.code == "ArrowUp") {
        slideUp();
        setTwo();

    }
    else if (e.code == "ArrowDown") {
        slideDown();
        setTwo();
    }
    document.getElementById("score").innerText = score;

    loseState();
})

// --- TOUCH CONTROLS FOR IPAD ---
document.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

document.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    const threshold = 30; // minimum swipe distance
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold) slideRight();
        else if (deltaX < -threshold) slideLeft();
    } else {
        // Vertical swipe
        if (deltaY > threshold) slideDown();
        else if (deltaY < -threshold) slideUp();
    }

    // After swipe, spawn new tile and update score
    setTwo();
    document.getElementById("score").innerText = score;
    loseState();
});

// Prevent page scrolling on mobile while swiping
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false });

function filterZero(row){
    return row.filter(num => num != 0); //create new array of all nums != 0
}

function slide(row) {
    //[0, 2, 2, 2] 
    row = filterZero(row); //[2, 2, 2]
    for (let i = 0; i < row.length-1; i++){
        if (row[i] == row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
        }
    } //[4, 0, 2]
    row = filterZero(row); //[4, 2]
    //add zeroes
    while (row.length < columns) {
        row.push(0);
    } //[4, 2, 0, 0]
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++){
        let tile = document.getElementById(r + "-" + c);
        let num = board[r][c];
        updateTile(tile, num, r, c); // pass in new row/column
    }
  }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];         //[0, 2, 2, 2]
        row.reverse();              //[2, 2, 2, 0]
        row = slide(row)            //[4, 2, 0, 0]
        board[r] = row.reverse();   //[0, 0, 2, 4];
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++){
        let tile = document.getElementById(r + "-" + c);
        let num = board[r][c];
        updateTile(tile, num, r, c); // pass in new row/column
    }
  }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++){
        let tile = document.getElementById(r + "-" + c);
        let num = board[r][c];
        updateTile(tile, num, r, c); // pass in new row/column
    }
  }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        row = slide(row);
        row.reverse();
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
    for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++){
        let tile = document.getElementById(r + "-" + c);
        let num = board[r][c];
        updateTile(tile, num, r, c); // pass in new row/column
    }
  }
}

function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        //find random row and column to place a 2 in
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "2";
            tile.classList.add("x2");
            found = true;
        }
    }
}

function hasEmptyTile() {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { //at least one zero in the board
                return true;
            }
        }
    }
    return false;
}

function loseState() {
  if (!hasEmptyTile() && !canMove()) {
    window.location.href = "loser.html";
  }
}

function canMove() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let num = board[r][c];
      // check right
      if (c < columns - 1 && num == board[r][c + 1]) return true;
      // check down
      if (r < rows - 1 && num == board[r + 1][c]) return true;
    }
  }
  return false;
}