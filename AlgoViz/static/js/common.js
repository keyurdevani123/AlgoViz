// Common utility functions and classes for DSA Visualizer

/**
 * Animation controller for managing visualization steps
 */
class AnimationController {
    constructor() {
        this.steps = [];
        this.currentStep = -1;
        this.isPlaying = false;
        this.isPaused = false;
        this.speed = 5; // 1-10 scale
        this.intervalId = null;
        this.stepCallback = null;
    }

    setSteps(steps) {
        this.steps = steps;
        this.currentStep = -1;
        this.updateStepDisplay();
    }

    setStepCallback(callback) {
        this.stepCallback = callback;
    }

    setSpeed(speed) {
        this.speed = Math.max(1, Math.min(10, speed));
        if (this.isPlaying && !this.isPaused) {
            this.pause();
            this.play();
        }
    }

    getDelay() {
        // Convert speed (1-10) to delay in milliseconds (2000-200)
        return 2200 - (this.speed * 200);
    }

    play() {
        if (this.steps.length === 0) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        
        this.intervalId = setInterval(() => {
            if (this.currentStep < this.steps.length - 1) {
                this.nextStep();
            } else {
                this.stop();
            }
        }, this.getDelay());
    }

    pause() {
        this.isPaused = true;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.currentStep = -1;
        this.updateStepDisplay();
        if (this.stepCallback) {
            this.stepCallback(null);
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateStepDisplay();
            if (this.stepCallback) {
                this.stepCallback(this.steps[this.currentStep]);
            }
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateStepDisplay();
            if (this.stepCallback) {
                this.stepCallback(this.steps[this.currentStep]);
            }
        }
    }

    updateStepDisplay() {
        const currentStepEl = document.getElementById('currentStep');
        const totalStepsEl = document.getElementById('totalSteps');
        
        if (currentStepEl) {
            currentStepEl.textContent = Math.max(0, this.currentStep + 1);
        }
        if (totalStepsEl) {
            totalStepsEl.textContent = this.steps.length;
        }
    }

    isAtEnd() {
        return this.currentStep >= this.steps.length - 1;
    }

    isAtStart() {
        return this.currentStep <= 0;
    }
}

/**
 * Canvas utility functions
 */
class CanvasUtils {
    static drawRect(ctx, x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    static drawCircle(ctx, x, y, radius, color, strokeColor = null) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    static drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    static drawText(ctx, text, x, y, color = '#000', font = '14px Arial', align = 'center') {
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
    }

    static clearCanvas(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }

    static getCanvasCoordinates(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}

/**
 * Color scheme for different algorithm states
 */
const ColorScheme = {
    default: '#6c757d',
    primary: '#0d6efd',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    
    // Specific colors for algorithm states
    comparing: '#0d6efd',
    swapping: '#dc3545',
    sorted: '#198754',
    current: '#ffc107',
    visiting: '#0dcaf0',
    processed: '#198754',
    inStack: '#ffc107',
    
    // Graph colors
    unvisited: '#6c757d',
    visited: '#198754',
    currentNode: '#0d6efd',
    inQueue: '#ffc107',
    
    // Tree colors
    treeNode: '#e9ecef',
    treeNodeBorder: '#6c757d',
    treeEdge: '#6c757d',
    
    // Text colors
    text: '#212529',
    textLight: '#6c757d',
    textDark: '#000000'
};

/**
 * Pseudocode templates for different algorithms
 */
const PseudocodeTemplates = {
    bubbleSort: `// Bubble Sort Algorithm
function bubbleSort(arr):
    n = length(arr)
    for i = 0 to n-1:
        for j = 0 to n-i-2:
            if arr[j] > arr[j+1]:
                swap(arr[j], arr[j+1])
    return arr`,

    selectionSort: `// Selection Sort Algorithm
function selectionSort(arr):
    n = length(arr)
    for i = 0 to n-1:
        min_idx = i
        for j = i+1 to n-1:
            if arr[j] < arr[min_idx]:
                min_idx = j
        swap(arr[i], arr[min_idx])
    return arr`,

    insertionSort: `// Insertion Sort Algorithm
function insertionSort(arr):
    for i = 1 to length(arr)-1:
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j = j - 1
        arr[j+1] = key
    return arr`,

    mergeSort: `// Merge Sort Algorithm
function mergeSort(arr, left, right):
    if left < right:
        mid = (left + right) / 2
        mergeSort(arr, left, mid)
        mergeSort(arr, mid+1, right)
        merge(arr, left, mid, right)

function merge(arr, left, mid, right):
    // Merge two sorted subarrays`,

    quickSort: `// Quick Sort Algorithm
function quickSort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quickSort(arr, low, pi-1)
        quickSort(arr, pi+1, high)

function partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j = low to high-1:
        if arr[j] <= pivot:
            i = i + 1
            swap(arr[i], arr[j])
    swap(arr[i+1], arr[high])
    return i + 1`,

    inorderTraversal: `// Inorder Traversal
function inorder(node):
    if node is not null:
        inorder(node.left)
        process(node.val)
        inorder(node.right)`,

    preorderTraversal: `// Preorder Traversal
function preorder(node):
    if node is not null:
        process(node.val)
        preorder(node.left)
        preorder(node.right)`,

    postorderTraversal: `// Postorder Traversal
function postorder(node):
    if node is not null:
        postorder(node.left)
        postorder(node.right)
        process(node.val)`,

    factorial: `// Factorial Function
function factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n-1)`,

    fibonacci: `// Fibonacci Function
function fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)`,

    towerOfHanoi: `// Tower of Hanoi
function hanoi(n, source, dest, aux):
    if n == 1:
        move disk from source to dest
    else:
        hanoi(n-1, source, aux, dest)
        move disk n from source to dest
        hanoi(n-1, aux, dest, source)`,

    reverseString: `// Reverse String
function reverse(str):
    if length(str) <= 1:
        return str
    else:
        return reverse(str[1:]) + str[0]`,

    bfs: `// Breadth-First Search
function BFS(graph, start):
    queue = [start]
    visited = set()
    
    while queue is not empty:
        current = queue.dequeue()
        if current not in visited:
            visited.add(current)
            for neighbor in graph[current]:
                if neighbor not in visited:
                    queue.enqueue(neighbor)`,

    dfs: `// Depth-First Search
function DFS(graph, start):
    stack = [start]
    visited = set()
    
    while stack is not empty:
        current = stack.pop()
        if current not in visited:
            visited.add(current)
            for neighbor in graph[current]:
                if neighbor not in visited:
                    stack.push(neighbor)`
};

/**
 * Utility functions
 */
const Utils = {
    // Generate random array
    generateRandomArray(size = 8, min = 10, max = 100) {
        const array = [];
        for (let i = 0; i < size; i++) {
            array.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return array;
    },

    // Generate random tree
    generateRandomTree(size = 7) {
        const nodes = [];
        for (let i = 1; i <= size; i++) {
            if (Math.random() > 0.2) { // 80% chance to include node
                nodes.push(Math.floor(Math.random() * 100) + 1);
            } else {
                nodes.push('null');
            }
        }
        return nodes;
    },

    // Generate random graph edges
    generateRandomGraph(nodeCount = 5) {
        const edges = [];
        const edgeSet = new Set();
        
        // Ensure graph is connected by creating a spanning tree
        for (let i = 1; i < nodeCount; i++) {
            const parent = Math.floor(Math.random() * i);
            const edge = `${parent}-${i}`;
            edges.push(edge);
            edgeSet.add(edge);
            edgeSet.add(`${i}-${parent}`);
        }
        
        // Add some additional random edges
        const additionalEdges = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < additionalEdges; i++) {
            const u = Math.floor(Math.random() * nodeCount);
            const v = Math.floor(Math.random() * nodeCount);
            if (u !== v && !edgeSet.has(`${u}-${v}`)) {
                edges.push(`${u}-${v}`);
                edgeSet.add(`${u}-${v}`);
                edgeSet.add(`${v}-${u}`);
            }
        }
        
        return edges;
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show error message
    showError(message, elementId = 'currentAction') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<span class="text-danger">Error: ${message}</span>`;
            element.className = 'alert alert-danger mb-0';
        }
    },

    // Show success message
    showSuccess(message, elementId = 'currentAction') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<span class="text-success">${message}</span>`;
            element.className = 'alert alert-success mb-0';
        }
    },

    // Show info message
    showInfo(message, elementId = 'currentAction') {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = message;
            element.className = 'alert alert-info mb-0';
        }
    },

    // Format array for display
    formatArray(array) {
        return '[' + array.join(', ') + ']';
    },

    // Format complexity notation
    formatComplexity(complexity) {
        return complexity.replace(/\^/g, '<sup>').replace(/(\d+)<sup>/g, '$1</sup>');
    }
};

/**
 * Initialize common event listeners and setup
 */
document.addEventListener('DOMContentLoaded', function() {
    // Setup canvas resize handlers
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', Utils.debounce(resizeCanvas, 250));
    });

    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Space bar for play/pause
        if (event.code === 'Space' && event.target.tagName !== 'INPUT') {
            event.preventDefault();
            const playBtn = document.getElementById('startBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            
            if (playBtn && !playBtn.disabled) {
                playBtn.click();
            } else if (pauseBtn && !pauseBtn.disabled) {
                pauseBtn.click();
            }
        }
        
        // Arrow keys for step navigation
        if (event.code === 'ArrowRight' && event.target.tagName !== 'INPUT') {
            event.preventDefault();
            const stepBtn = document.getElementById('stepBtn');
            if (stepBtn && !stepBtn.disabled) {
                stepBtn.click();
            }
        }
        
        // R key for reset
        if (event.code === 'KeyR' && event.target.tagName !== 'INPUT') {
            event.preventDefault();
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.click();
            }
        }
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationController,
        CanvasUtils,
        ColorScheme,
        PseudocodeTemplates,
        Utils
    };
}
