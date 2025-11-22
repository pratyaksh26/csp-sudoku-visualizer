<div align="center">

# 🧩 CSP Sudoku Visualizer

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Grid-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An interactive engine visualizing Constraint Satisfaction Problems (CSP) through the lens of Sudoku.**

[🔴 View Live Demo](https://pratyaksh26.github.io/csp-sudoku-visualizer/)

</div>

<br />

<div align="center">
  <img width="100%" alt="CSP Sudoku Visualizer Dashboard" src="https://github.com/user-attachments/assets/2bd7ba23-d15e-4c77-aac7-46607a3150f4" />
</div>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Algorithm Comparison](#-algorithm-comparison)
- [Heuristics](#-heuristics)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started-locally)

---

## 🔭 Overview

This system is a VisuAlgo-style algorithm visualizer built to demonstrate the core concepts of Constraint Satisfaction Problems (CSPs). The primary goal is to provide an intuitive, visual interface for understanding complex search algorithms.

By utilizing a Sudoku environment as the constraint domain, the tool allows students and developers to:

Visualize Constraint Propagation: See how a single assignment impacts the domains of neighboring variables (Forward Checking & AC-3).

Trace Backtracking: Observe the "depth-first" nature of the search and visually identify when and why the algorithm decides to backtrack.

Compare Heuristics: Experiment with different variable ordering strategies (like MRV) to see their impact on search efficiency.

---

## 🌟 Key Features

* **⚡ Real-time Reasoning:** Watch the solver's "thought process." See domains (pencil marks) shrink dynamically as constraints are propagated across the grid.
* **🖥️ Dual-View Interface:**
    * **Left Panel:** The "World State" (The active Sudoku grid and domain visualizations).
    * **Right Panel:** The "Logic State" (Live execution tracer highlighting the exact line of pseudocode running).
* **⚙️ Interactive Controls:**
    * **Speed Control:** Adjust simulation speed from 5ms to 500ms.
    * **Difficulty Presets:** Pre-loaded puzzles ranging from 'Easy' to the computationally expensive 'Evil'.
* **📊 Performance Metrics:** Tracks nodes visited and backtrack counts to objectively compare algorithm efficiency.

---

## 🧠 Algorithm Comparison

This tool allows for direct performance comparison of three fundamental CSP approaches:

| Algorithm | Type | Description | Visual Behavior |
| :--- | :--- | :--- | :--- |
| **Backtracking (BT)** | *Brute Force* | A naive depth-first search. It assigns values sequentially and only backtracks when a direct conflict occurs. | 🔴 **High Failure Rate:** You will see the AI making "dumb" guesses that obviously conflict with row/column numbers. |
| **Forward Checking (FC)** | *Look-Ahead* | When a variable is assigned, the engine filters the domains of unassigned neighbors. If a domain becomes empty, it backtracks immediately. | 🟡 **Pruning:** When a cell is assigned (Green), connected pencil marks vanish instantly. Prevents "dead-end" branches early. |
| **MAC (AC-3)** | *Propagation* | **Maintaining Arc Consistency.** Uses the AC-3 algorithm to trigger a recursive "ripple effect," propagating constraints across the entire board. | 🟢 **Smart Solving:** One assignment may clear pencil marks on the opposite side of the grid. Solves hard puzzles with minimal backtracking. |

---

## 🧪 Heuristics

The engine implements variable ordering heuristics to optimize search speed:

* **Linear Scan:** Selects the next empty cell in order (Top-left to Bottom-right).
* **MRV (Minimum Remaining Values):** Also known as the "Fail-First" principle. The engine dynamically selects the cell with the smallest domain (fewest possibilities). This drastically reduces the branching factor of the search tree.

---

## 🛠️ Tech Stack

* **Core Logic:** Vanilla JavaScript (ES6+) with Object-Oriented architecture.
* **Visualization:** DOM manipulation via CSS Grid (optimized for crisp text rendering over Canvas).
* **Styling:** Semantic HTML5 & Modern CSS3 variables.
* **Architecture:** Separation of concerns between `UI Layer`, `Data Model` (Cells/Domains), and the `Solver Engine`.

---

## 🚀 Getting Started Locally

This project is built with vanilla web technologies and requires no build steps, bundlers, or package managers.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR-USERNAME/csp-sudoku-visualizer.git](https://github.com/YOUR-USERNAME/csp-sudoku-visualizer.git)
    ```

2.  **Navigate to the directory**
    ```bash
    cd csp-sudoku-visualizer
    ```

3.  **Launch**
    Simply open `index.html` in your preferred web browser.

---

## 📂 Project Structure

```text
csp-sudoku-visualizer/
├── index.html      # Main application entry point & layout
├── style.css       # Grid systems, animations, and visual theming
├── script.js       # Core logic (Game loop, CSP Engine, Heuristics)
└── README.md       # Documentation
