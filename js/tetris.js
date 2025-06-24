document.addEventListener('DOMContentLoaded', () => {
    const width = 10;
    const cells = [];
    const nextGrid = document.getElementById('next-grid');
    const nextCells = [];

    const grid = document.getElementById('grid');
    const overlay = document.getElementById('game-over-overlay');
    const restartBtn = document.getElementById('restart-button');
    const startButton = document.getElementById('start-button');
    const noKeyboardOverlay = document.getElementById('no-keyboard-overlay');

    if (isMobileDevice()) {
      noKeyboardOverlay.classList.remove('hidden');
      startButton.disabled = true;
    } else {
      noKeyboardOverlay.classList.add('hidden');
      startButton.disabled = false;
    }

      noKeyboardOverlay.classList.remove('hidden');
      startButton.disabled = true;

    for (let i = 0; i < 16; i++) {
      const div = document.createElement('div');
      nextGrid.appendChild(div);
      nextCells.push(div);
    }

    // Create 200 cells for grid (20 rows x 10 columns)
    for (let i = 0; i < 200; i++) {
      const cell = document.createElement('div');
      grid.appendChild(cell);
      cells.push(cell);
    }

    // Add 10 extra cells at the bottom as "floor"
    for (let i = 0; i < 10; i++) {
      const cell = document.createElement('div');
      cell.classList.add('taken', 'floor');
      grid.appendChild(cell);
      cells.push(cell);
    }

    // Tetromino shapes with rotations
    const tetrominoes = [
      // J 
      [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
      ],
      // Z
      [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
      ],
      // T
      [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
      ],
      // O
      [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
      ],
      // I
      [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
      ],
      // S
      [
        [1, width, width + 1, width * 2],
        [width, width + 1, width * 2 + 1, width * 2 + 2],
        [1, width, width + 1, width * 2],
        [width, width + 1, width * 2 + 1, width * 2 + 2]
      ],
      // L
      [
        [0, width, width * 2, width * 2 + 1],
        [width, width + 1, width + 2, 2],
        [1, width + 1, width * 2 + 1, 0],
        [width + 2, width + 1, width, width * 2]
      ]
    ];

    const previewShapes = [
      // J
      [1, 5, 9, 8],
      // Z
      [1, 2, 4, 5],
      // T
      [1, 4, 5, 6],
      // O
      [0, 1, 4, 5],
      // I
      [1, 5, 9, 13],
      // S
      [0, 1, 5, 6],
      // L
      [1, 5, 9, 10]
    ];


    let speed = 1000;
    const speedStep = 5;
    const minSpeed = 150;
    let timerId = null;
    let currentPosition = 4;
    let currentRotation = 0;
    let currentTetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
    let nextTetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
    let current = tetrominoes[currentTetrominoIndex][currentRotation];

    const scoreDisplay = document.getElementById('score');
    let score = 0;

    function draw() {
      const tetrominoClasses = ['j', 'z', 't', 'o', 'i', 's', 'l'];
      const className = tetrominoClasses[currentTetrominoIndex];

      current.forEach(index => {
        const cell = cells[currentPosition + index];
        cell.classList.add('tetromino', className);
      });
    }

    function undraw() {
      const tetrominoClasses = ['j', 'z', 't', 'o', 'i', 's', 'l'];
      const className = tetrominoClasses[currentTetrominoIndex];

      current.forEach(index => {
        const cell = cells[currentPosition + index];
        cell.classList.remove('tetromino', className);
      });
    }

    function showNext() {
      const tetrominoClasses = ['j', 'z', 't', 'o', 'i', 's', 'l'];

      nextCells.forEach(cell => {
        cell.className = '';
      });

      previewShapes[nextTetrominoIndex].forEach(index => {
        nextCells[index].classList.add('preview', tetrominoClasses[nextTetrominoIndex]);
      });
      console.log("Next tetromino index:", nextTetrominoIndex);
    }

    function moveDown() {
      if (canMoveDown()) {
        undraw();
        currentPosition += width;
        draw();
      } else {
        freeze();
      }
    }

    function freeze() {
      if (current.some(index => cells[currentPosition + index + width].classList.contains('taken'))) {
        current.forEach(index => cells[currentPosition + index].classList.add('taken'));

        checkCompletedRows();

        currentPosition = 4;
        currentRotation = 0;

        currentTetrominoIndex = nextTetrominoIndex;
        nextTetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
        current = tetrominoes[currentTetrominoIndex][currentRotation];

        draw();
        showNext();

        checkGameOver();
      }
    }

    function checkGameOver() {
      if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
        gameOver();
      }
    }

    function gameOver() {
      // Stop the game timer to pause the game
      clearInterval(timerId);
      timerId = null;

      // Show the game over overlay
      const overlay = document.getElementById('game-over-overlay');
      overlay.classList.remove('hidden');
    }

    function canMoveDown() {
      return !current.some(index => cells[currentPosition + index + width].classList.contains('taken'));
    }

    function isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Controls
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') moveLeft();
      else if (e.key === 'ArrowRight') moveRight();
      else if (e.key === 'ArrowDown') moveDown();
      else if (e.key === 'ArrowUp') rotate();
    });

    function canMoveLeft() {
      // Check left edge
      if (current.some(index => (currentPosition + index) % width === 0)) return false;
      // Check collision
      return !current.some(index => cells[currentPosition + index - 1].classList.contains('taken'));
    }

    function moveLeft() {
      if (canMoveLeft()) {
        undraw();
        currentPosition -= 1;
        draw();
      }
    }

    function canMoveRight() {
      // Check if any part of the tetromino is at the right edge
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
      if (isAtRightEdge) return false;

      // Check if moving right would cause a collision with taken cells
      return !current.some(index => cells[currentPosition + index + 1].classList.contains('taken'));
    }

    function moveRight() {
      if (canMoveRight()) {
        undraw();
        currentPosition += 1;
        draw();
      }
    }

    function canRotate() {
      const nextRotation = (currentRotation + 1) % tetrominoes[currentTetrominoIndex].length;
      const nextShape = tetrominoes[currentTetrominoIndex][nextRotation];
      
      // Check edges and collisions for nextShape at currentPosition
      return !nextShape.some(index => {
        const pos = currentPosition + index;
        return pos < 0 || pos >= cells.length || cells[pos].classList.contains('taken') || (pos % width === 0 && index % width === width - 1);
      });
    }

    function rotate() {
      if (canRotate()) {
        undraw();
        currentRotation = (currentRotation + 1) % tetrominoes[currentTetrominoIndex].length;
        current = tetrominoes[currentTetrominoIndex][currentRotation];
        draw();
      }
    }

    function checkCompletedRows() {
      for (let row = 0; row < 200; row += width) {
        // Get indexes of all cells in this row
        const rowCells = [];
        for (let i = 0; i < width; i++) {
          rowCells.push(row + i);
        }

        // Check if every cell in the row has 'taken' class
        const isComplete = rowCells.every(index => cells[index].classList.contains('taken'));

        if (isComplete) {
          // Remove 'taken' and 'tetromino' classes from the row
          rowCells.forEach(index => {
            cells[index].classList.remove('taken', 'tetromino');
          });

          // Remove the row cells from the DOM and cells array
          const removedCells = cells.splice(row, width);
          removedCells.forEach(cell => grid.removeChild(cell));

          // Create new empty cells at the top and add them to DOM and cells array
          for (let i = 0; i < width; i++) {
            const newCell = document.createElement('div');
            grid.insertBefore(newCell, grid.firstChild);
            cells.unshift(newCell);
          }

          // Update score or any other logic here
          score += 10;
          scoreDisplay.textContent = score;

          row -= width;
        }
      }
    }

    function restartGame() {
      overlay.classList.add('hidden');

      for (let i = 0; i < 200; i++) {
        cells[i].className = '';
      }

      for (let i = 200; i < 210; i++) {
        cells[i].className = 'taken floor';
      }

      score = 0;
      scoreDisplay.textContent = score;
      speed = 1000;
      currentPosition = 4;
      currentRotation = 0;
      currentTetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
      nextTetrominoIndex = Math.floor(Math.random() * tetrominoes.length);
      current = tetrominoes[currentTetrominoIndex][currentRotation];

      draw();
      showNext();

      timerId = setInterval(moveDown, Math.max(200, speed));
    }


    document.getElementById('start-button').addEventListener('click', () => {
          if (timerId) return;
          draw();
          showNext();
          timerId = setInterval(moveDown, speed);
        });

    restartBtn.addEventListener('click', () => {
      restartGame();
    });
  });