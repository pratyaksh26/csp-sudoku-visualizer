# 🧩 CSP Sudoku Visualizer

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange) ![Status](https://img.shields.io/badge/Status-Live-brightgreen)



## 🌟 Key Features

* **Real-time Visualization:** Watch the AI reason through the puzzle. See domains (pencil marks) shrink as constraints are propagated.
* **Dual-View Interface:**
    * **Left:** The "World State" (Sudoku Board).
    * **Right:** The "Logic State" (Pseudocode highlighting).
* **Algorithm Comparator:** Switch dynamically between:
    * Backtracking (Naive)
    * Forward Checking
    * MAC (Maintaining Arc Consistency / AC-3)
* **Heuristic Toggle:** Visualize the performance difference between Linear Scanning and **MRV** (Minimum Remaining Values).
* **Interactive Controls:** Speed slider, Pause/Resume, and Difficulty presets (Easy, Hard, Evil).

---

## 🧠 The Science Behind It

This project is not just a game solver; it is a visual proof of how **Constraint Satisfaction Problems (CSPs)** work.

### 1. The Algorithms
* **Backtracking (BT):** The brute-force approach. It tries a value, moves to the next cell, and backtracks immediately upon conflict.
    * *Visual cue:* You will see the AI making "dumb" guesses that obviously conflict with row/column numbers.
* **Forward Checking (FC):** When a variable is assigned, the algorithm looks at its immediate neighbors and removes inconsistent values from their domains.
    * *Visual cue:* When a cell turns Green, watch the pencil marks in the same row/col/box vanish instantly.
* **MAC (Maintaining Arc Consistency):** Uses the **AC-3** algorithm. When a value is assigned, it triggers a "ripple effect" of constraint propagation throughout the entire board.
    * *Visual cue:* One assignment might cause pencil marks to disappear on the opposite side of the board.

### 2. The Heuristics
* **MRV (Minimum Remaining Values):** Also known as "Fail-First." The algorithm dynamically selects the cell with the fewest remaining options (smallest domain). This drastically reduces the branching factor of the search tree.

---

## 🛠️ Tech Stack

* **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3.
* **Rendering:** DOM manipulation with CSS Grid (no heavy Canvas libraries).
* **Architecture:** Object-Oriented JS with a clean separation between the **UI Layer**, **Data Model** (Cells/Domains), and **Solver Engine**.

---

## 🚀 Getting Started Locally

Since this project uses vanilla JavaScript, no build process (npm/webpack) is required.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR-USERNAME/csp-sudoku-visualizer.git](https://github.com/YOUR-USERNAME/csp-sudoku-visualizer.git)
    ```
2.  **Open the project**
    Simply navigate to the folder and double-click `index.html` to open it in your browser.

---

## 📂 Project Structure

```text
├── index.html      # Main layout (Split screen design)
├── style.css       # Visual styling, Grid layout, and Animations
├── script.js       # The "Brain" (Classes, Solver Logic, Event Handling)
└── README.md       # Documentation
