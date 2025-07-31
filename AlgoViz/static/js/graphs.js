// Graph traversal visualization
class GraphVisualizer {
    constructor() {
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationController = new AnimationController();
        this.graph = {};
        this.steps = [];
        this.currentAlgorithm = 'bfs';
        this.nodePositions = [];
        this.edges = [];
        this.nodeCount = 5;
        this.startNode = 0;
        this.traversalOrder = [];
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupAnimationController();
        this.loadInitialGraph();
        this.updatePseudocode();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth - 2;
            this.canvas.height = container.clientHeight - 2;
            this.drawGraph();
        };
        
        resizeCanvas();
        window.addEventListener('resize', Utils.debounce(resizeCanvas, 250));
    }

    setupEventListeners() {
        // Algorithm selection
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
            this.updatePseudocode();
            this.updateDataStructureTitle();
            this.reset();
        });

        // Graph parameters
        document.getElementById('nodesInput').addEventListener('input', (e) => {
            this.nodeCount = Math.max(3, Math.min(8, parseInt(e.target.value) || 3));
            e.target.value = this.nodeCount;
        });

        document.getElementById('startNodeInput').addEventListener('input', (e) => {
            this.startNode = Math.max(0, parseInt(e.target.value) || 0);
        });

        // Generate random graph
        document.getElementById('generateGraphBtn').addEventListener('click', () => {
            this.generateRandomGraph();
        });

        // Build graph button
        document.getElementById('buildGraphBtn').addEventListener('click', () => {
            this.buildGraphFromInput();
        });

        // Speed control
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.animationController.setSpeed(parseInt(e.target.value));
        });

        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pause();
        });

        document.getElementById('stepBtn').addEventListener('click', () => {
            this.step();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
    }

    setupAnimationController() {
        this.animationController.setStepCallback((step) => {
            this.drawGraph(step);
            this.updateCurrentAction(step);
            this.updateDataStructure(step);
            this.updateTraversalOrder(step);
            this.highlightPseudocode(step);
        });
    }

    loadInitialGraph() {
        this.buildGraphFromInput();
        this.updateDataStructureTitle();
    }

    buildGraphFromInput() {
        try {
            this.nodeCount = parseInt(document.getElementById('nodesInput').value) || 5;
            this.startNode = Math.max(0, Math.min(this.nodeCount - 1, parseInt(document.getElementById('startNodeInput').value) || 0));
            
            // Update start node input to valid range
            document.getElementById('startNodeInput').max = this.nodeCount - 1;
            document.getElementById('startNodeInput').value = this.startNode;
            
            const edgesInput = document.getElementById('edgesInput').value.trim();
            this.edges = [];
            
            if (edgesInput) {
                const edgePairs = edgesInput.split(',');
                for (const pair of edgePairs) {
                    const [u, v] = pair.split('-').map(x => parseInt(x.trim()));
                    if (!isNaN(u) && !isNaN(v) && u >= 0 && v >= 0 && u < this.nodeCount && v < this.nodeCount && u !== v) {
                        this.edges.push([u, v]);
                    }
                }
            }
            
            this.buildGraph();
            this.calculateNodePositions();
            this.drawGraph();
            this.traversalOrder = [];
            this.updateTraversalOrderDisplay();
            Utils.showInfo('Graph built successfully');
            
        } catch (error) {
            Utils.showError(`Invalid graph format: ${error.message}`);
        }
    }

    buildGraph() {
        this.graph = {};
        
        // Initialize all nodes
        for (let i = 0; i < this.nodeCount; i++) {
            this.graph[i] = [];
        }
        
        // Add edges
        for (const [u, v] of this.edges) {
            this.graph[u].push(v);
            this.graph[v].push(u); // Undirected graph
        }
    }

    calculateNodePositions() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 50;
        
        this.nodePositions = [];
        
        if (this.nodeCount <= 4) {
            // Special layouts for small graphs
            switch (this.nodeCount) {
                case 3:
                    this.nodePositions = [
                        { x: centerX, y: centerY - radius/2 },
                        { x: centerX - radius/2, y: centerY + radius/2 },
                        { x: centerX + radius/2, y: centerY + radius/2 }
                    ];
                    break;
                case 4:
                    this.nodePositions = [
                        { x: centerX - radius/2, y: centerY - radius/2 },
                        { x: centerX + radius/2, y: centerY - radius/2 },
                        { x: centerX + radius/2, y: centerY + radius/2 },
                        { x: centerX - radius/2, y: centerY + radius/2 }
                    ];
                    break;
            }
        } else {
            // Circular layout for larger graphs
            for (let i = 0; i < this.nodeCount; i++) {
                const angle = (2 * Math.PI * i) / this.nodeCount - Math.PI / 2; // Start from top
                this.nodePositions.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
        }
    }

    generateRandomGraph() {
        this.nodeCount = Math.floor(Math.random() * 4) + 4; // 4-7 nodes
        document.getElementById('nodesInput').value = this.nodeCount;
        
        const edges = Utils.generateRandomGraph(this.nodeCount);
        document.getElementById('edgesInput').value = edges.join(',');
        
        this.startNode = 0;
        document.getElementById('startNodeInput').value = this.startNode;
        
        this.buildGraphFromInput();
    }

    async start() {
        if (this.nodeCount === 0) {
            Utils.showError('Please build a graph first');
            return;
        }

        if (this.startNode >= this.nodeCount) {
            Utils.showError('Start node must be less than number of nodes');
            return;
        }

        try {
            this.setControlsState('loading');
            Utils.showInfo('Loading traversal steps...');

            const edgesParam = this.edges.map(([u, v]) => `${u}-${v}`).join(',');
            const url = `/api/graph/${this.currentAlgorithm}?edges=${encodeURIComponent(edgesParam)}&nodes=${this.nodeCount}&start=${this.startNode}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch traversal steps');

            const data = await response.json();
            this.steps = data.steps;
            this.animationController.setSteps(this.steps);
            this.traversalOrder = [];
            
            this.setControlsState('playing');
            this.animationController.play();
            
        } catch (error) {
            Utils.showError(`Failed to start traversal: ${error.message}`);
            this.setControlsState('idle');
        }
    }

    pause() {
        this.animationController.pause();
        this.setControlsState('paused');
    }

    step() {
        this.animationController.nextStep();
    }

    reset() {
        this.animationController.reset();
        this.setControlsState('idle');
        this.traversalOrder = [];
        this.updateTraversalOrderDisplay();
        this.updateDataStructure(null);
        this.drawGraph();
        this.updateCurrentAction(null);
        this.clearPseudocodeHighlight();
    }

    setControlsState(state) {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stepBtn = document.getElementById('stepBtn');

        switch (state) {
            case 'idle':
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                stepBtn.disabled = true;
                startBtn.innerHTML = '<i data-feather="play" class="feather-sm me-1"></i>Start Traversal';
                break;
            case 'loading':
                startBtn.disabled = true;
                pauseBtn.disabled = true;
                stepBtn.disabled = true;
                startBtn.innerHTML = '<div class="loading-spinner"></div>Loading...';
                break;
            case 'playing':
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                stepBtn.disabled = true;
                break;
            case 'paused':
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                stepBtn.disabled = false;
                startBtn.innerHTML = '<i data-feather="play" class="feather-sm me-1"></i>Resume';
                break;
        }
        
        feather.replace();
    }

    drawGraph(step = null) {
        if (!this.canvas || this.nodePositions.length === 0) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        CanvasUtils.clearCanvas(ctx, width, height);

        // Draw edges first
        this.drawEdges(ctx, step);
        
        // Draw nodes
        this.drawNodes(ctx, step);
        
        // Draw labels
        this.drawLabels(ctx);
    }

    drawEdges(ctx, step) {
        for (const [u, v] of this.edges) {
            const pos1 = this.nodePositions[u];
            const pos2 = this.nodePositions[v];
            
            if (pos1 && pos2) {
                let color = ColorScheme.treeEdge;
                let width = 2;
                
                // Highlight edges involved in current step
                if (step && step.current !== undefined) {
                    const current = step.current;
                    if ((u === current && this.graph[current] && this.graph[current].includes(v)) ||
                        (v === current && this.graph[current] && this.graph[current].includes(u))) {
                        color = ColorScheme.primary;
                        width = 3;
                    }
                }
                
                CanvasUtils.drawLine(ctx, pos1.x, pos1.y, pos2.x, pos2.y, color, width);
            }
        }
    }

    drawNodes(ctx, step) {
        const nodeRadius = 20;
        
        for (let i = 0; i < this.nodeCount; i++) {
            const pos = this.nodePositions[i];
            if (!pos) continue;
            
            let nodeColor = ColorScheme.unvisited;
            let borderColor = ColorScheme.treeNodeBorder;
            
            if (step) {
                if (step.visited && step.visited.includes(i)) {
                    nodeColor = ColorScheme.visited;
                    borderColor = ColorScheme.success;
                } else if (step.current === i) {
                    nodeColor = ColorScheme.currentNode;
                    borderColor = ColorScheme.primary;
                } else if (step.queue && step.queue.includes(i)) {
                    nodeColor = ColorScheme.inQueue;
                    borderColor = ColorScheme.warning;
                } else if (step.stack && step.stack.includes(i)) {
                    nodeColor = ColorScheme.inQueue;
                    borderColor = ColorScheme.warning;
                }
            }
            
            // Special highlighting for start node
            if (i === this.startNode && (!step || step.type === 'initialize')) {
                nodeColor = ColorScheme.currentNode;
                borderColor = ColorScheme.primary;
            }
            
            CanvasUtils.drawCircle(ctx, pos.x, pos.y, nodeRadius, nodeColor, borderColor);
            CanvasUtils.drawText(ctx, i.toString(), pos.x, pos.y + 5, ColorScheme.text, '14px Arial');
        }
    }

    drawLabels(ctx) {
        // Draw start node label
        if (this.startNode < this.nodePositions.length) {
            const pos = this.nodePositions[this.startNode];
            if (pos) {
                CanvasUtils.drawText(ctx, 'START', pos.x, pos.y - 35, ColorScheme.primary, '10px Arial');
            }
        }
    }

    updateCurrentAction(step) {
        const actionElement = document.getElementById('currentAction');
        if (!actionElement) return;

        if (!step) {
            Utils.showInfo('Build a graph and select a traversal algorithm');
            return;
        }

        Utils.showInfo(step.description || 'Processing...');
    }

    updateDataStructure(step) {
        const dataStructureElement = document.getElementById('dataStructure');
        if (!dataStructureElement) return;

        if (!step) {
            dataStructureElement.innerHTML = '<div class="text-muted">Start traversal to see queue/stack</div>';
            return;
        }

        const isQueue = this.currentAlgorithm === 'bfs';
        const structure = isQueue ? (step.queue || []) : (step.stack || []);
        
        if (structure.length === 0) {
            dataStructureElement.innerHTML = `<div class="text-muted">Empty ${isQueue ? 'queue' : 'stack'}</div>`;
        } else {
            const items = structure.map(item => 
                `<span class="data-structure-item">${item}</span>`
            ).join('');
            dataStructureElement.innerHTML = items;
        }
    }

    updateDataStructureTitle() {
        const titleElement = document.getElementById('dataStructureTitle');
        if (titleElement) {
            titleElement.textContent = this.currentAlgorithm === 'bfs' ? 'Queue (BFS)' : 'Stack (DFS)';
        }
    }

    updateTraversalOrder(step) {
        if (!step) return;

        if (step.type === 'visit' && step.current !== undefined) {
            if (!this.traversalOrder.includes(step.current)) {
                this.traversalOrder.push(step.current);
                this.updateTraversalOrderDisplay();
            }
        }
    }

    updateTraversalOrderDisplay() {
        const orderElement = document.getElementById('traversalOrder');
        if (!orderElement) return;

        if (this.traversalOrder.length === 0) {
            orderElement.textContent = 'Build a graph and start traversal to see the order';
        } else {
            orderElement.textContent = this.traversalOrder.join(' → ');
        }
    }

    updatePseudocode() {
        const pseudocodeElement = document.getElementById('pseudocodeDisplay');
        if (!pseudocodeElement) return;

        const template = PseudocodeTemplates[this.currentAlgorithm];
        if (template) {
            pseudocodeElement.innerHTML = `<code>${template}</code>`;
        }
    }

    highlightPseudocode(step) {
        if (!step || !step.pseudocode_line) {
            this.clearPseudocodeHighlight();
            return;
        }

        const pseudocodeElement = document.getElementById('pseudocodeDisplay');
        if (!pseudocodeElement) return;

        this.clearPseudocodeHighlight();

        const code = pseudocodeElement.querySelector('code');
        if (code) {
            const lines = code.innerHTML.split('\n');
            const highlightedLines = lines.map(line => {
                if (step.pseudocode_line.includes('queue') && line.includes('queue')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                } else if (step.pseudocode_line.includes('stack') && line.includes('stack')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                } else if (step.pseudocode_line.includes('visited') && line.includes('visited')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                } else if (step.pseudocode_line.includes('current') && line.includes('current')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                }
                return line;
            });
            code.innerHTML = highlightedLines.join('\n');
        }
    }

    clearPseudocodeHighlight() {
        const pseudocodeElement = document.getElementById('pseudocodeDisplay');
        if (!pseudocodeElement) return;

        const code = pseudocodeElement.querySelector('code');
        if (code) {
            code.innerHTML = code.innerHTML.replace(/<span class="pseudocode-highlight">(.*?)<\/span>/g, '$1');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GraphVisualizer();
});
