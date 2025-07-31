// Binary tree traversal visualization
class TreeVisualizer {
    constructor() {
        this.canvas = document.getElementById('treeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationController = new AnimationController();
        this.tree = null;
        this.steps = [];
        this.currentTraversal = 'inorder';
        this.traversalResult = [];
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupAnimationController();
        this.loadInitialTree();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth - 2;
            this.canvas.height = container.clientHeight - 2;
            this.drawTree();
        };
        
        resizeCanvas();
        window.addEventListener('resize', Utils.debounce(resizeCanvas, 250));
    }

    setupEventListeners() {
        // Traversal selection
        document.getElementById('traversalSelect').addEventListener('change', (e) => {
            this.currentTraversal = e.target.value;
            this.updatePseudocode();
            this.reset();
        });

        // Tree input
        document.getElementById('treeInput').addEventListener('input', Utils.debounce(() => {
            this.buildTreeFromInput();
        }, 500));

        // Generate random tree
        document.getElementById('generateTreeBtn').addEventListener('click', () => {
            this.generateRandomTree();
        });

        // Build tree button
        document.getElementById('buildTreeBtn').addEventListener('click', () => {
            this.buildTreeFromInput();
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
            this.drawTree(step);
            this.updateCurrentAction(step);
            this.updateCallStack(step);
            this.updateTraversalResult(step);
            this.highlightPseudocode(step);
        });
    }

    loadInitialTree() {
        this.buildTreeFromInput();
        this.updatePseudocode();
    }

    buildTreeFromInput() {
        const input = document.getElementById('treeInput').value.trim();
        if (!input) return;

        try {
            const nodes = input.split(',').map(x => {
                const trimmed = x.trim();
                return trimmed === 'null' ? null : parseInt(trimmed);
            });

            this.tree = this.buildBinaryTree(nodes);
            this.drawTree();
            this.traversalResult = [];
            this.updateTraversalResultDisplay();
            Utils.showInfo('Tree built successfully');
        } catch (error) {
            Utils.showError(`Invalid tree format: ${error.message}`);
        }
    }

    buildBinaryTree(nodes) {
        if (!nodes || nodes.length === 0 || nodes[0] === null) return null;

        const root = { val: nodes[0], left: null, right: null };
        const queue = [root];
        let i = 1;

        while (queue.length > 0 && i < nodes.length) {
            const node = queue.shift();

            if (i < nodes.length && nodes[i] !== null) {
                node.left = { val: nodes[i], left: null, right: null };
                queue.push(node.left);
            }
            i++;

            if (i < nodes.length && nodes[i] !== null) {
                node.right = { val: nodes[i], left: null, right: null };
                queue.push(node.right);
            }
            i++;
        }

        return root;
    }

    generateRandomTree() {
        const nodes = Utils.generateRandomTree(7);
        document.getElementById('treeInput').value = nodes.join(',');
        this.buildTreeFromInput();
    }

    async start() {
        if (!this.tree) {
            Utils.showError('Please build a tree first');
            return;
        }

        try {
            this.setControlsState('loading');
            Utils.showInfo('Loading traversal steps...');

            const treeData = document.getElementById('treeInput').value;
            const response = await fetch(`/api/tree/traversal/${this.currentTraversal}?tree=${encodeURIComponent(treeData)}`);
            if (!response.ok) throw new Error('Failed to fetch traversal steps');

            const data = await response.json();
            this.steps = data.steps;
            this.animationController.setSteps(this.steps);
            this.traversalResult = [];
            
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
        this.traversalResult = [];
        this.updateTraversalResultDisplay();
        this.updateCallStack(null);
        this.drawTree();
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

    drawTree(step = null) {
        if (!this.canvas || !this.tree) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        CanvasUtils.clearCanvas(ctx, width, height);

        // Calculate tree layout
        const nodeRadius = 20;
        const levelHeight = 60;
        const positions = this.calculateNodePositions(this.tree, width, height, nodeRadius, levelHeight);

        // Draw edges first
        this.drawEdges(ctx, this.tree, positions, step);
        
        // Draw nodes
        this.drawNodes(ctx, this.tree, positions, step, nodeRadius);
    }

    calculateNodePositions(root, width, height, nodeRadius, levelHeight) {
        const positions = new Map();
        
        // Calculate tree width and height
        const treeHeight = this.getTreeHeight(root);
        const startY = 40;
        
        // Use level-order traversal to position nodes
        const queue = [{node: root, level: 0, position: 0}];
        const levelNodes = [];
        
        // Group nodes by level
        while (queue.length > 0) {
            const {node, level, position} = queue.shift();
            
            if (!levelNodes[level]) levelNodes[level] = [];
            levelNodes[level].push({node, position});
            
            if (node.left) {
                queue.push({node: node.left, level: level + 1, position: position * 2});
            }
            if (node.right) {
                queue.push({node: node.right, level: level + 1, position: position * 2 + 1});
            }
        }
        
        // Calculate positions for each level
        levelNodes.forEach((nodes, level) => {
            const levelWidth = Math.pow(2, level);
            const spacing = (width - 80) / (levelWidth + 1);
            
            nodes.forEach(({node, position}) => {
                const x = 40 + spacing * (position + 1);
                const y = startY + level * levelHeight;
                positions.set(node, {x, y});
            });
        });
        
        return positions;
    }

    getTreeHeight(node) {
        if (!node) return 0;
        return 1 + Math.max(this.getTreeHeight(node.left), this.getTreeHeight(node.right));
    }

    drawEdges(ctx, node, positions, step) {
        if (!node) return;
        
        const pos = positions.get(node);
        if (!pos) return;
        
        // Draw edge to left child
        if (node.left) {
            const leftPos = positions.get(node.left);
            if (leftPos) {
                let color = ColorScheme.treeEdge;
                if (step && (step.node === node.val || step.next_node === node.left.val)) {
                    color = ColorScheme.primary;
                }
                CanvasUtils.drawLine(ctx, pos.x, pos.y, leftPos.x, leftPos.y, color, 2);
            }
            this.drawEdges(ctx, node.left, positions, step);
        }
        
        // Draw edge to right child
        if (node.right) {
            const rightPos = positions.get(node.right);
            if (rightPos) {
                let color = ColorScheme.treeEdge;
                if (step && (step.node === node.val || step.next_node === node.right.val)) {
                    color = ColorScheme.primary;
                }
                CanvasUtils.drawLine(ctx, pos.x, pos.y, rightPos.x, rightPos.y, color, 2);
            }
            this.drawEdges(ctx, node.right, positions, step);
        }
    }

    drawNodes(ctx, node, positions, step, radius) {
        if (!node) return;
        
        const pos = positions.get(node);
        if (!pos) return;
        
        // Determine node color based on step
        let nodeColor = ColorScheme.treeNode;
        let borderColor = ColorScheme.treeNodeBorder;
        
        if (step && step.node === node.val) {
            if (step.type === 'process') {
                nodeColor = ColorScheme.processed;
                borderColor = ColorScheme.success;
            } else if (step.type === 'visit' || step.type === 'go_left' || step.type === 'go_right') {
                nodeColor = ColorScheme.current;
                borderColor = ColorScheme.primary;
            }
        }
        
        // Draw node
        CanvasUtils.drawCircle(ctx, pos.x, pos.y, radius, nodeColor, borderColor);
        
        // Draw node value
        CanvasUtils.drawText(ctx, node.val.toString(), pos.x, pos.y + 5, ColorScheme.text, '14px Arial');
        
        // Recursively draw children
        this.drawNodes(ctx, node.left, positions, step, radius);
        this.drawNodes(ctx, node.right, positions, step, radius);
    }

    updateCurrentAction(step) {
        const actionElement = document.getElementById('currentAction');
        if (!actionElement) return;

        if (!step) {
            Utils.showInfo('Build a tree and select a traversal method');
            return;
        }

        Utils.showInfo(step.description || 'Processing...');
    }

    updateCallStack(step) {
        const callStackElement = document.getElementById('callStack');
        if (!callStackElement) return;

        if (!step || !step.call_stack) {
            callStackElement.innerHTML = '<div class="text-muted">Start traversal to see call stack</div>';
            return;
        }

        const stackHtml = step.call_stack.map((call, index) => {
            const isTop = index === step.call_stack.length - 1;
            const className = isTop ? 'call-stack-item active' : 'call-stack-item';
            return `<div class="${className}">${call}</div>`;
        }).reverse().join('');

        callStackElement.innerHTML = stackHtml || '<div class="text-muted">Empty stack</div>';
    }

    updateTraversalResult(step) {
        if (!step) return;

        if (step.type === 'process') {
            this.traversalResult.push(step.node);
            this.updateTraversalResultDisplay();
        }
    }

    updateTraversalResultDisplay() {
        const resultElement = document.getElementById('traversalResult');
        if (!resultElement) return;

        if (this.traversalResult.length === 0) {
            resultElement.textContent = 'Build a tree and start traversal to see the result';
        } else {
            resultElement.textContent = this.traversalResult.join(' → ');
        }
    }

    updatePseudocode() {
        const pseudocodeElement = document.getElementById('pseudocodeDisplay');
        if (!pseudocodeElement) return;

        const template = PseudocodeTemplates[this.currentTraversal + 'Traversal'];
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
                if (line.includes('process') && step.pseudocode_line.includes('process')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                } else if (line.includes('inorder') && step.pseudocode_line.includes('inorder')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                } else if (line.includes('preorder') && step.pseudocode_line.includes('preorder')) {
                    return `<span class="pseudocode-highlight">${line}</span>`;
                } else if (line.includes('postorder') && step.pseudocode_line.includes('postorder')) {
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
    new TreeVisualizer();
});
