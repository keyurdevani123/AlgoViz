// Sorting algorithms visualization
class SortingVisualizer {
    constructor() {
        this.canvas = document.getElementById('sortingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationController = new AnimationController();
        this.array = [];
        this.steps = [];
        this.currentAlgorithm = 'bubble';
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupAnimationController();
        this.loadInitialData();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth - 2; // Account for border
            this.canvas.height = container.clientHeight - 2;
            this.draw();
        };
        
        resizeCanvas();
        window.addEventListener('resize', Utils.debounce(resizeCanvas, 250));
    }

    setupEventListeners() {
        // Algorithm selection
        document.getElementById('algorithmSelect').addEventListener('change', (e) => {
            this.currentAlgorithm = e.target.value;
            this.updatePseudocode();
            this.updateComplexityInfo();
            this.reset();
        });

        // Array input
        document.getElementById('arrayInput').addEventListener('input', Utils.debounce(() => {
            this.loadArrayFromInput();
        }, 500));

        // Generate random array
        document.getElementById('generateRandomBtn').addEventListener('click', () => {
            this.generateRandomArray();
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
            this.draw(step);
            this.updateCurrentAction(step);
            this.highlightPseudocode(step);
        });
    }

    loadInitialData() {
        this.loadArrayFromInput();
        this.updatePseudocode();
        this.updateComplexityInfo();
    }

    loadArrayFromInput() {
        const input = document.getElementById('arrayInput').value.trim();
        if (!input) return;

        try {
            this.array = input.split(',').map(x => {
                const num = parseInt(x.trim());
                if (isNaN(num)) throw new Error('Invalid number');
                return num;
            });
            
            if (this.array.length === 0) throw new Error('Empty array');
            if (this.array.length > 20) throw new Error('Array too large (max 20 elements)');
            
            this.draw();
            Utils.showInfo('Array loaded successfully');
        } catch (error) {
            Utils.showError(`Invalid array format: ${error.message}`);
        }
    }

    generateRandomArray() {
        this.array = Utils.generateRandomArray(8, 10, 100);
        document.getElementById('arrayInput').value = this.array.join(',');
        this.draw();
        Utils.showInfo('Random array generated');
    }

    async start() {
        if (this.array.length === 0) {
            Utils.showError('Please enter an array first');
            return;
        }

        try {
            this.setControlsState('loading');
            Utils.showInfo('Loading algorithm steps...');

            const response = await fetch(`/api/sort/${this.currentAlgorithm}?data=${this.array.join(',')}`);
            if (!response.ok) throw new Error('Failed to fetch algorithm steps');

            const data = await response.json();
            this.steps = data.steps;
            this.animationController.setSteps(this.steps);
            
            this.setControlsState('playing');
            this.animationController.play();
            
        } catch (error) {
            Utils.showError(`Failed to start sorting: ${error.message}`);
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
        this.draw();
        this.updateCurrentAction(null);
        this.clearPseudocodeHighlight();
    }

    setControlsState(state) {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stepBtn = document.getElementById('stepBtn');
        const resetBtn = document.getElementById('resetBtn');

        switch (state) {
            case 'idle':
                startBtn.disabled = false;
                pauseBtn.disabled = true;
                stepBtn.disabled = true;
                startBtn.innerHTML = '<i data-feather="play" class="feather-sm me-1"></i>Start Sorting';
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
        
        // Refresh feather icons
        feather.replace();
    }

    draw(step = null) {
        if (!this.canvas || this.array.length === 0) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        CanvasUtils.clearCanvas(ctx, width, height);
        
        // Calculate bar dimensions
        const padding = 20;
        const barWidth = (width - padding * 2) / this.array.length;
        const maxValue = Math.max(...this.array);
        const barHeightScale = (height - padding * 2) / maxValue;

        // Get current array state
        let currentArray = this.array;
        if (step && step.array) {
            currentArray = step.array;
        }

        // Draw bars
        currentArray.forEach((value, index) => {
            const x = padding + index * barWidth;
            const barHeight = value * barHeightScale;
            const y = height - padding - barHeight;
            
            // Determine bar color based on step
            let color = ColorScheme.default;
            if (step) {
                if (step.comparing && step.comparing.includes(index)) {
                    color = ColorScheme.comparing;
                } else if (step.swapped && step.swapped.includes(index)) {
                    color = ColorScheme.swapping;
                } else if (step.type === 'complete') {
                    color = ColorScheme.sorted;
                } else if (step.current_min === index) {
                    color = ColorScheme.current;
                } else if (step.key_index === index) {
                    color = ColorScheme.current;
                } else if (step.pivot_index === index) {
                    color = ColorScheme.warning;
                } else if (step.merged_index === index) {
                    color = ColorScheme.success;
                }
            }
            
            // Draw bar
            CanvasUtils.drawRect(ctx, x + 2, y, barWidth - 4, barHeight, color);
            
            // Draw value text
            CanvasUtils.drawText(
                ctx, 
                value.toString(), 
                x + barWidth / 2, 
                y - 5, 
                ColorScheme.text, 
                '12px Arial'
            );
        });

        // Draw additional information for specific algorithms
        if (step && step.type === 'merge_start' && step.left_subarray && step.right_subarray) {
            this.drawMergeInfo(ctx, step, width, height);
        }
    }

    drawMergeInfo(ctx, step, width, height) {
        const infoY = height - 60;
        const leftInfo = `Left: [${step.left_subarray.join(', ')}]`;
        const rightInfo = `Right: [${step.right_subarray.join(', ')}]`;
        
        CanvasUtils.drawText(ctx, leftInfo, 20, infoY, ColorScheme.info, '12px Arial', 'left');
        CanvasUtils.drawText(ctx, rightInfo, 20, infoY + 20, ColorScheme.warning, '12px Arial', 'left');
    }

    updateCurrentAction(step) {
        const actionElement = document.getElementById('currentAction');
        if (!actionElement) return;

        if (!step) {
            Utils.showInfo('Select an algorithm and click Start to begin');
            return;
        }

        Utils.showInfo(step.description || 'Processing...');
    }

    updatePseudocode() {
        const pseudocodeElement = document.getElementById('pseudocodeDisplay');
        if (!pseudocodeElement) return;

        const template = PseudocodeTemplates[this.currentAlgorithm + 'Sort'] || PseudocodeTemplates[this.currentAlgorithm];
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

        // Remove existing highlights
        this.clearPseudocodeHighlight();

        // Add highlight to current line
        const code = pseudocodeElement.querySelector('code');
        if (code) {
            const lines = code.innerHTML.split('\n');
            const highlightedLines = lines.map(line => {
                if (line.includes(step.pseudocode_line.replace(/[<>]/g, ''))) {
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

    updateComplexityInfo() {
        const complexities = {
            bubble: { time_best: 'O(n)', time_avg: 'O(n²)', time_worst: 'O(n²)', space: 'O(1)' },
            selection: { time_best: 'O(n²)', time_avg: 'O(n²)', time_worst: 'O(n²)', space: 'O(1)' },
            insertion: { time_best: 'O(n)', time_avg: 'O(n²)', time_worst: 'O(n²)', space: 'O(1)' },
            merge: { time_best: 'O(n log n)', time_avg: 'O(n log n)', time_worst: 'O(n log n)', space: 'O(n)' },
            quick: { time_best: 'O(n log n)', time_avg: 'O(n log n)', time_worst: 'O(n²)', space: 'O(log n)' }
        };

        const complexity = complexities[this.currentAlgorithm];
        if (complexity) {
            document.getElementById('timeBest').textContent = complexity.time_best;
            document.getElementById('timeAvg').textContent = complexity.time_avg;
            document.getElementById('timeWorst').textContent = complexity.time_worst;
            document.getElementById('spaceComplexity').textContent = complexity.space;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});
