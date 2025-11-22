// --- CONFIGURATION & DATA ---
const ROWS = 9;
const COLS = 9;
let speed = 50;
let isPaused = false;
let isSolving = false;

// Standard Puzzles
const LEVELS = {
    'easy': [
        [5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3], [4, 0, 0, 8, 0, 3, 0, 0, 1], [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0], [0, 0, 0, 4, 1, 9, 0, 0, 5], [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    'hard': [
        [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 3, 0, 8, 5], [0, 0, 1, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 5, 0, 7, 0, 0, 0], [0, 0, 4, 0, 0, 0, 1, 0, 0], [0, 9, 0, 0, 0, 0, 0, 0, 0],
        [5, 0, 0, 0, 0, 0, 0, 7, 3], [0, 0, 2, 0, 1, 0, 0, 0, 0], [0, 0, 0, 0, 4, 0, 0, 0, 9]
    ],
    'evil': [ // The famous "Arto Inkala" hardest sudoku
        [8, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 3, 6, 0, 0, 0, 0, 0], [0, 7, 0, 0, 9, 0, 2, 0, 0],
        [0, 5, 0, 0, 0, 7, 0, 0, 0], [0, 0, 0, 0, 4, 5, 7, 0, 0], [0, 0, 0, 1, 0, 0, 0, 3, 0],
        [0, 0, 1, 0, 0, 0, 0, 6, 8], [0, 0, 8, 5, 0, 0, 0, 1, 0], [0, 9, 0, 0, 0, 0, 4, 0, 0]
    ]
};

// --- CLASSES ---

class Cell {
    constructor(r, c, val = 0) {
        this.r = r;
        this.c = c;
        this.val = val;
        this.fixed = (val !== 0);
        this.domain = this.fixed ? [val] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.domElement = null;
    }
}

class Game {
    constructor() {
        this.grid = [];
        this.stats = { nodes: 0, backtracks: 0 };
        this.algorithm = 'fc'; // bt, fc, ac3
        this.heuristic = 'mrv';
        this.initBoard();
    }

    initBoard() {
        const boardEl = document.getElementById('sudoku-board');
        boardEl.innerHTML = '';
        this.grid = [];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let cell = new Cell(r, c);
                this.grid.push(cell);

                // DOM Creation
                let el = document.createElement('div');
                el.className = 'cell';
                if ((r + 1) % 3 === 0 && r !== 8) el.classList.add('row-end');

                // Pencil Marks
                let dGrid = document.createElement('div');
                dGrid.className = 'domain-grid';
                for (let i = 1; i <= 9; i++) {
                    let dVal = document.createElement('span');
                    dVal.className = 'd-val';
                    dVal.innerText = i;
                    dVal.id = `d-${r}-${c}-${i}`;
                    dGrid.appendChild(dVal);
                }

                let mainVal = document.createElement('span');
                mainVal.className = 'main-val';

                el.appendChild(dGrid);
                el.appendChild(mainVal);
                cell.domElement = el;
                boardEl.appendChild(el);
            }
        }
    }

    loadLevel(level) {
        this.reset();
        const data = LEVELS[level];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                let val = data[r][c];
                if (val !== 0) {
                    let cell = this.getCell(r, c);
                    cell.val = val;
                    cell.fixed = true;
                    cell.domain = [val];
                    cell.domElement.classList.add('fixed');
                    this.updateCellVisuals(cell);
                }
            }
        }
        // Initial Pruning for fixed values
        this.initialPropagate();
    }

    reset() {
        isSolving = false;
        isPaused = false;
        this.stats = { nodes: 0, backtracks: 0 };
        this.updateStats();
        document.querySelectorAll('.cell').forEach(el => {
            el.className = 'cell';
            if ((Array.from(el.parentNode.children).indexOf(el) + 1) % 27 === 0) {/*check row logic later*/ }; // Keeping simple reset
        });
        this.initBoard(); // Rebuild clean board
        Logger.clear();
        HighlightCode(0); // Clear code
    }

    getCell(r, c) { return this.grid[r * 9 + c]; }

    // Gets row, col, and box peers
    getPeers(cell) {
        let peers = [];
        for (let other of this.grid) {
            if (other === cell) continue;
            let isRow = other.r === cell.r;
            let isCol = other.c === cell.c;
            let isBox = Math.floor(other.r / 3) === Math.floor(cell.r / 3) &&
                Math.floor(other.c / 3) === Math.floor(cell.c / 3);
            if (isRow || isCol || isBox) peers.push(other);
        }
        return peers;
    }

    updateCellVisuals(cell) {
        // Big Number
        const mainSpan = cell.domElement.querySelector('.main-val');
        mainSpan.innerText = cell.val !== 0 ? cell.val : '';

        // Pencil Marks
        for (let i = 1; i <= 9; i++) {
            let dEl = document.getElementById(`d-${cell.r}-${cell.c}-${i}`);
            // If val is set, hide all pencil marks. Else show only available domain.
            if (cell.val !== 0) {
                dEl.style.opacity = 0;
            } else {
                dEl.style.opacity = cell.domain.includes(i) ? 1 : 0;
            }
        }
    }

    initialPropagate() {
        // Quick AC3 pass just to clear domains of fixed numbers without animation
        let fixedCells = this.grid.filter(c => c.fixed);
        for (let f of fixedCells) {
            let peers = this.getPeers(f);
            for (let p of peers) {
                if (!p.fixed) {
                    p.domain = p.domain.filter(d => d !== f.val);
                    this.updateCellVisuals(p);
                }
            }
        }
    }

    updateStats() {
        document.getElementById('nodeCount').innerText = this.stats.nodes;
        document.getElementById('backtrackCount').innerText = this.stats.backtracks;
    }
}

// --- SOLVER LOGIC (CSP ENGINE) ---

const Solver = {
    async start() {
        if (isSolving) return;
        isSolving = true;
        game.stats.nodes = 0;
        game.stats.backtracks = 0;
        game.updateStats();

        // Check if board is valid before starting
        if (game.algorithm === 'ac3') {
            // Optional: You could run an initial AC3 pass here, 
            // but for visualization, it's better to just start the loop.
        }

        let result = await this.backtrack();

        if (result) {
            document.getElementById('status-banner').innerText = "Solved!";
            document.getElementById('status-banner').style.background = "#28a745";
        } else {
            document.getElementById('status-banner').innerText = "No Solution";
            document.getElementById('status-banner').style.background = "#dc3545";
        }
        isSolving = false;
        HighlightCode(2);
    },

    async backtrack() {
        if (!isSolving) return false;

        // PAUSE LOGIC
        while (isPaused) await sleep(100);

        game.stats.nodes++;
        game.updateStats();

        // 1. Select Unassigned Variable
        HighlightCode(3);
        let cell = this.selectUnassignedVariable();
        if (!cell) return true; // Success! No empty cells left.

        // Visual Focus
        cell.domElement.classList.add('processing');
        await sleep(speed);

        // 2. Try Values
        HighlightCode(4);
        // Important: Create a copy of the domain to iterate over
        let originalDomain = [...cell.domain];

        for (let val of originalDomain) {

            // Check consistency (Basic neighbor check)
            HighlightCode(5);
            if (this.isConsistent(cell, val)) {

                // ASSIGN
                HighlightCode(6);
                cell.val = val;
                cell.domElement.classList.add('assigned');
                game.updateCellVisuals(cell);
                Logger.log(`Assign ${val} to (${cell.r},${cell.c})`);

                // INFERENCE (Forward Checking / MAC)
                HighlightCode(7);
                let inferences = []; // Stores {cell, val} of pruned domains
                let inferenceSuccess = true;

                if (game.algorithm === 'fc') {
                    inferences = await this.runForwardChecking(cell, val);
                } else if (game.algorithm === 'ac3') {
                    inferences = await this.runMAC(cell, val);
                } else {
                    // Backtracking (BT) - No inference, just dummy empty array
                    inferences = [];
                }

                // If inference returned null, it means Domain Wipeout (Failure)
                if (inferences === null) inferenceSuccess = false;

                if (inferenceSuccess) {
                    // RECURSE
                    HighlightCode(9);
                    let result = await this.backtrack();
                    if (result) return true;
                }

                // BACKTRACK (Undo Assignment)
                HighlightCode(10);
                // If we are here, it means either Inference failed OR Recursion failed
                Logger.log(`Backtrack from (${cell.r},${cell.c})`, "fail");
                game.stats.backtracks++;
                game.updateStats();

                this.restoreInferences(inferences); // Undo pruning
            }

            // Reset cell value for next iteration
            cell.val = 0;
            cell.domElement.classList.remove('assigned');
            game.updateCellVisuals(cell);
            await sleep(speed);
        }

        cell.domElement.classList.remove('processing');
        HighlightCode(11);
        return false;
    },

    selectUnassignedVariable() {
        let unassigned = game.grid.filter(c => c.val === 0);
        if (unassigned.length === 0) return null;

        if (game.heuristic === 'mrv') {
            // Sort by domain length (ascending) so we pick the one with fewest options
            unassigned.sort((a, b) => a.domain.length - b.domain.length);
            return unassigned[0];
        } else {
            // Linear: Just pick the first one found (Top-Left)
            return unassigned[0];
        }
    },

    isConsistent(cell, val) {
        let peers = game.getPeers(cell);
        for (let p of peers) {
            // If peer is assigned and has the same value, it's a conflict
            if (p.val === val) return false;
        }
        return true;
    },

    // --- STRATEGY 1: FORWARD CHECKING ---
    async runForwardChecking(cell, val) {
        let pruned = [];
        let peers = game.getPeers(cell);

        for (let p of peers) {
            if (p.val === 0) { // Only check unassigned neighbors
                let idx = p.domain.indexOf(val);
                if (idx !== -1) {
                    // Prune
                    p.domain.splice(idx, 1);
                    game.updateCellVisuals(p);
                    pruned.push({ cell: p, val: val });

                    // Domain Wipeout Check
                    if (p.domain.length === 0) {
                        p.domElement.classList.add('conflict');
                        await sleep(speed * 2);
                        p.domElement.classList.remove('conflict');
                        return null; // Fail
                    }
                }
            }
        }
        return pruned;
    },

    // --- STRATEGY 2: MAC (Cascading Inference) ---
    async runMAC(cell, val) {
        let pruned = [];
        let queue = []; // Queue of cells that have been reduced to 1 option

        // Step 1: Initial Forward Check (Neighbors of the Just-Assigned Cell)
        let peers = game.getPeers(cell);
        for (let p of peers) {
            if (p.val === 0 && p.domain.includes(val)) {
                p.domain.splice(p.domain.indexOf(val), 1);
                game.updateCellVisuals(p);
                pruned.push({ cell: p, val: val });

                if (p.domain.length === 0) {
                    await this.flashConflict(p);
                    return null; // DWO
                }

                // If domain reduced to 1, add to queue for cascading
                if (p.domain.length === 1) queue.push(p);
            }
        }

        // Step 2: Cascade (Propagate the "Forced" values)
        while (queue.length > 0) {
            let current = queue.shift();
            let forcedVal = current.domain[0]; // The only value left

            let currentPeers = game.getPeers(current);
            for (let neighbor of currentPeers) {
                if (neighbor.val === 0 && neighbor.domain.includes(forcedVal)) {

                    // Prune the forced value from the neighbor
                    neighbor.domain.splice(neighbor.domain.indexOf(forcedVal), 1);
                    game.updateCellVisuals(neighbor);
                    pruned.push({ cell: neighbor, val: forcedVal });

                    if (neighbor.domain.length === 0) {
                        await this.flashConflict(neighbor);
                        return null; // DWO failure
                    }

                    // If this neighbor is now also forced, add to queue
                    if (neighbor.domain.length === 1) {
                        // Prevent infinite loops or re-adding same cell
                        if (!queue.includes(neighbor)) queue.push(neighbor);
                    }
                }
            }
        }

        return pruned;
    },

    async flashConflict(cell) {
        cell.domElement.classList.add('conflict');
        await sleep(speed * 2);
        cell.domElement.classList.remove('conflict');
    },

    restoreInferences(prunedList) {
        if (!prunedList) return;
        // Restore in reverse order to maintain consistency
        for (let i = prunedList.length - 1; i >= 0; i--) {
            let item = prunedList[i];
            // Only add back if not already there (safety check)
            if (!item.cell.domain.includes(item.val)) {
                item.cell.domain.push(item.val);
                item.cell.domain.sort((a, b) => a - b);
                game.updateCellVisuals(item.cell);
            }
        }
    }
};

// --- HELPERS ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const Logger = {
    box: document.getElementById('log-container'),
    log(msg, type = '') {
        const div = document.createElement('div');
        div.className = `log-entry log-${type}`;
        div.innerText = `> ${msg}`;
        this.box.appendChild(div);
        this.box.scrollTop = this.box.scrollHeight;
    },
    clear() { this.box.innerHTML = ''; }
};

function HighlightCode(lineNum) {
    // Remove old highlight
    document.querySelectorAll('.highlight-code').forEach(el => el.classList.remove('highlight-code'));
    // Add new
    if (lineNum > 0) {
        let el = document.getElementById(`line-${lineNum}`);
        if (el) el.classList.add('highlight-code');
    }
}

// --- INITIALIZATION & EVENTS ---
const game = new Game();
game.loadLevel('easy');

document.getElementById('btnStart').onclick = () => {
    game.algorithm = document.getElementById('algoSelect').value;
    game.heuristic = document.getElementById('heuristicSelect').value;
    isPaused = false;
    Solver.start();
};

document.getElementById('btnPause').onclick = () => {
    isPaused = !isPaused;
    document.getElementById('btnPause').innerHTML = isPaused ? '<i class="fas fa-play"></i> Resume' : '<i class="fas fa-pause"></i> Pause';
};

document.getElementById('btnReset').onclick = () => game.loadLevel('easy');

document.getElementById('speedRange').oninput = (e) => {
    speed = 505 - e.target.value; // Invert so right is faster
    document.getElementById('speedDisplay').innerText = e.target.value + ' (val)';
};