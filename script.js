/* 2048 template using p5 + p5.play
   - Paste into a p5 sketch that also loads p5.play.
   - Grid is 4x4. Tiles are sprites with a "value" property.
   - Arrow keys (or WASD) to move. After each valid move, a new tile spawns.
   - Score tracked, game-over detection included.
*/

// GRID CONFIG
const ROWS = 4;
const COLS = 4;
const CELL_SIZE = 100;      // pixel size of each cell
const PADDING = 16;        // padding around grid
const BOARD_X = 40;        // top-left x of board
const BOARD_Y = 40;        // top-left y of board

// GAME STATE
let grid;                 // 2D array of tile objects (or null)
let tilesGroup;           // p5.play Group for tile sprites
let score = 0;
let animSpeed = 0.2;      // for simple lerp movement of sprites

// Preload fonts or assets here if desired
function preload() {
  // e.g., loadFont('assets/yourfont.ttf')
}

function setup() {
  createCanvas(BOARD_X * 2 + COLS * CELL_SIZE, BOARD_Y * 2 + ROWS * CELL_SIZE);
  tilesGroup = new Group();

  // initialize empty grid
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = null;
    }
  }

  // start with two tiles
  spawnRandomTile();
  spawnRandomTile();
}

function draw() {
  background(235);
  drawBoard();

  // update and draw all sprites (p5.play)
  // We use sprite.position to smoothly animate tiles to their target cell positions.
  tilesGroup.forEach(tile => {
    // target pixel pos based on tile.gridPos
    let tx = BOARD_X + tile.gridPos.col * CELL_SIZE + CELL_SIZE / 2;
    let ty = BOARD_Y + tile.gridPos.row * CELL_SIZE + CELL_SIZE / 2;

    // smooth movement
    tile.position.x += (tx - tile.position.x) * animSpeed;
    tile.position.y += (ty - tile.position.y) * animSpeed;

    // draw custom rectangle & value (we'll hide the default sprite shape)
    push();
    noStroke();
    fill(getColorForValue(tile.value));
    rectMode(CENTER);
    rect(tile.position.x, tile.position.y, CELL_SIZE - 8, CELL_SIZE - 8, 8);

    // value text
    fill(tile.value > 4 ? 255 : 50);
    textAlign(CENTER, CENTER);
    textSize(28);
    text(tile.value, tile.position.x, tile.position.y);
    pop();
  });

  drawHUD();
}

// Draw grid background and empty cells
function drawBoard() {
  push();
  // board background
  fill(187);
  rect(BOARD_X, BOARD_Y, COLS * CELL_SIZE, ROWS * CELL_SIZE, 8);

  // cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      fill(220);
      rect(
        BOARD_X + c * CELL_SIZE + 8,
        BOARD_Y + r * CELL_SIZE + 8,
        CELL_SIZE - 16,
        CELL_SIZE - 16,
        6
      );
    }
  }
  pop();
}

function drawHUD() {
  push();
  fill(50);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Score: " + score, BOARD_X, BOARD_Y + ROWS * CELL_SIZE + 16);

  // Game over / win checks
  if (isGameOver()) {
    fill(0, 150);
    rect(0, 0, width, height);
    fill(255);
    textSize(36);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 20);
    textSize(20);
    text("Press R to restart", width / 2, height / 2 + 20);
    noLoop(); // stop updates; press R to restart
  }
  pop();
}

/* -----------------------
   INPUT HANDLING
   ----------------------- */
function keyPressed() {
  let moved = false;
  if (keyCode === UP_ARROW || key === 'w' || key === 'W') {
    moved = move('up');
  } else if (keyCode === DOWN_ARROW || key === 's' || key === 'S') {
    moved = move('down');
  } else if (keyCode === LEFT_ARROW || key === 'a' || key === 'A') {
    moved = move('left');
  } else if (keyCode === RIGHT_ARROW || key === 'd' || key === 'D') {
    moved = move('right');
  } else if (key === 'r' || key === 'R') {
    restartGame();
  }

  if (moved) {
    // spawn new tile after a successful move
    spawnRandomTile();
    // check game over and stop loop if over
    if (isGameOver()) {
      // draw() shows the overlay — we already called noLoop() in drawHUD
    }
  }
}

/* -----------------------
   CORE GAME MECHANICS
   ----------------------- */

/**
 * Move tiles in a given direction.
 * Returns true if any tile moved/merged (i.e., state changed).
 *
 * Direction: 'up', 'down', 'left', 'right'
 */
function move(direction) {
  let moved = false;

  // We'll process rows/cols in an order depending on direction.
  // For each line (row/col), extract present tiles, compress toward direction,
  // merge adjacent equal values once, then write back to grid.
  // Also we must update sprite.gridPos for animation.
  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < ROWS; r++) {
      // extract non-null tiles
      let line = [];
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) line.push(grid[r][c]);
      }

      if (direction === 'right') line.reverse();

      // attempt merges on the 1D line
      let mergedLine = mergeLine(line);

      if (direction === 'right') mergedLine.reverse();

      // check if anything changed compared to original row
      for (let c = 0; c < COLS; c++) {
        let old = grid[r][c];
        let neu = mergedLine[c] || null;
        if (old !== neu) moved = moved || true;
        grid[r][c] = neu;

        // if neu exists, set its logical gridPos (sprite will lerp there)
        if (neu) {
          neu.gridPos = { row: r, col: c };
        }
      }
    }
  } else if (direction === 'up' || direction === 'down') {
    for (let c = 0; c < COLS; c++) {
      let line = [];
      for (let r = 0; r < ROWS; r++) {
        if (grid[r][c]) line.push(grid[r][c]);
      }

      if (direction === 'down') line.reverse();
      let mergedLine = mergeLine(line);
      if (direction === 'down') mergedLine.reverse();

      for (let r = 0; r < ROWS; r++) {
        let old = grid[r][c];
        let neu = mergedLine[r] || null;
        if (old !== neu) moved = moved || true;
        grid[r][c] = neu;
        if (neu) {
          neu.gridPos = { row: r, col: c };
        }
      }
    }
  }

  // After merges, remove sprites that were merged into others.
  // (mergeLine handles sprite removal when merging happens.)
  // Return whether anything changed.
  return moved;
}

/**
 * Given an array 'line' of tile objects (in the order of movement),
 * compresses them to the front, merges adjacent equal-value tiles once,
 * and returns a full-length array of length COLS where empties are null.
 *
 * side-effects:
 *  - When merging, it increases the value of the first tile and removes
 *    the second tile's sprite and returns the merged tile in the result.
 *  - increments the score.
 */
function mergeLine(line) {
  // 'line' is an array of tile objects that are present (no nulls),
  // in the order they should be moved/merged (e.g., for left, leftmost first).
  let result = [];
  let skip = false;
  for (let i = 0; i < line.length; i++) {
    if (skip) { skip = false; continue; }
    let current = line[i];
    let next = line[i + 1];
    if (next && current.value === next.value) {
      // merge current + next into current
      current.value *= 2;
      // remove next's sprite and from tilesGroup
      if (next.sprite) {
        next.sprite.remove();
      }
      next.remove = true; // mark for safety if you expand later
      score += current.value; // update score by merged value
      result.push(current);
      skip = true; // skip next since merged
    } else {
      result.push(current);
    }
  }

  // pad to full length with nulls
  while (result.length < COLS) result.push(null);
  return result;
}

/* -----------------------
   Tile spawn + helper
   ----------------------- */

/**
 * Creates a new tile object (with a p5.play sprite) at a given grid pos.
 * value is typically 2 or 4.
 */
function createTile(row, col, value) {
  // create an invisible sprite that we'll use only for position tracking
  let s = createSprite(BOARD_X + col * CELL_SIZE + CELL_SIZE / 2,
                       BOARD_Y + row * CELL_SIZE + CELL_SIZE / 2,
                       CELL_SIZE - 8, CELL_SIZE - 8);
  s.immovable = true; // not affected by physics
  // store properties on sprite for convenience:
  s.value = value;

  // Our logical tile object wraps sprite so we can store metadata
  let tile = {
    sprite: s,
    value: value,
    gridPos: { row: row, col: col }
  };

  // attach value directly on sprite for merge logic convenience
  s.value = value;
  tilesGroup.add(s);

  // store convenience reference: tile from sprite (not used everywhere, but helpful)
  s.tileRef = tile;

  return tile;
}

/**
 * Finds all empty cells and spawns a new tile randomly in one of them.
 * Typical 2048 spawns 2 most of the time and 4 occasionally.
 */
function spawnRandomTile() {
  let empties = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) empties.push({ r, c });
    }
  }
  if (empties.length === 0) return false;

  let idx = floor(random(empties.length));
  let pos = empties[idx];
  let value = random() < 0.9 ? 2 : 4; // 90% 2, 10% 4

  let tile = createTile(pos.r, pos.c, value);
  // IMPORTANT: keep grid reference to the tile object itself
  grid[pos.r][pos.c] = tile;
  return true;
}

/* -----------------------
   GAME UTILITIES
   ----------------------- */

function restartGame() {
  // remove all sprites
  tilesGroup.forEach(s => s.remove());
  tilesGroup.clear();

  // reset grid
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = null;
    }
  }
  score = 0;
  spawnRandomTile();
  spawnRandomTile();
  loop(); // restart draw loop
}

/**
 * Return true if no moves left (no empty cell and no adjacent equal tiles)
 */
function isGameOver() {
  // if any empty cell -> not over
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c]) return false;
    }
  }
  // check for adjacent equals horizontally or vertically
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let val = grid[r][c].value;
      if (r < ROWS - 1 && grid[r + 1][c] && grid[r + 1][c].value === val) return false;
      if (c < COLS - 1 && grid[r][c + 1] && grid[r][c + 1].value === val) return false;
    }
  }
  return true;
}

/* -----------------------
   VISUAL HELPERS
   ----------------------- */

function getColorForValue(v) {
  // Basic palette — tweak as you like
  const palette = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
  };
  return palette[v] || '#3c3a32';
}

/* -----------------------
   NOTES & EXTENSIONS you might want:
   - Add animations: scale tile on spawn, fade on merge.
   - Keep separate 'value' on sprite and on tile object consistently.
   - Add keyboard hold-to-move repeat logic.
   - Add "undo" by snapshotting grid state.
   - Make tiles tween faster for snappier feel (increase animSpeed).
   - Add touch/swipe input for mobile.
   - Improve merge logic visuals: spawn a merged tile animation, remove old tiles after animation.
   - Add 'win' condition (tile with 2048) and show a dialog.
*/

/* End of template */
