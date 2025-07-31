// Recursion algorithms visualization
class RecursionVisualizer {
    constructor() {
        this.canvas = document.getElementById('recursionCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationController = new AnimationController();
        this.steps = [];
        this.currentAlgorithm = 'factorial';
        this.currentParameter = 5;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupAnimationController();
        this.updateAlgorithmInfo();
        this.updatePseudocode();
        this.updateComplexityInfo();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth - 2;
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
            this.updateParameterSection();
            this.updateAlgorithmInfo();
            this.updatePseudocode();
            this.updateComplexityInfo();
            this.reset();
        });

        // Parameter inputs
        document.getElementById('numberInput').addEventListener('input', (e) => {
            this.currentParameter = parseInt(e.target.value) || 1;
        });

        document.getElementById('textInput').addEventListener('input', (e) => {
            this.currentParameter = e.target.value || 'hello';
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
            this.updateCallStack(step);
            this.highlightPseudocode(step);
        });
    }

    updateParameterSection() {
        const numberInput = document.getElementById('numberInput');
        const textInput = document.getElementById('textInput');
        const parameterLabel = document.getElementById('parameterLabel');
        const parameterHelp = document.getElementById('parameterHelp');

        if (this.currentAlgorithm === 'reverse') {
            numberInput.style.display = 'none';
            textInput.style.display = 'block';
            parameterLabel.textContent = 'Input String';
            parameterHelp.textContent = 'Enter a string to reverse';
            this.currentParameter = textInput.value;
        } else {
            numberInput.style.display = 'block';
            textInput.style.display = 'none';
            
            if (this.currentAlgorithm === 'tower') {
                parameterLabel.textContent = 'Number of Disks';
                parameterHelp.textContent = 'Enter number of disks (1-5 recommended)';
                numberInput.max = 5;
            } else {
                parameterLabel.textContent = 'Input Value (n)';
                parameterHelp.textContent = 'Enter a number between 1 and 10';
                numberInput.max = 10;
            }
            this.currentParameter = parseInt(numberInput.value) || 1;
        }
    }

    async start() {
        if (!this.validateParameter()) return;

        try {
            this.setControlsState('loading');
            Utils.showInfo('Loading recursion steps...');

            let url = `/api/recursion/${this.currentAlgorithm}`;
            if (this.currentAlgorithm === 'reverse') {
                url += `?text=${encodeURIComponent(this.currentParameter)}`;
            } else {
                url += `?n=${this.currentParameter}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch recursion steps');

            const data = await response.json();
            this.steps = data.steps;
            this.animationController.setSteps(this.steps);
            
            this.setControlsState('playing');
            this.animationController.play();
            
        } catch (error) {
            Utils.showError(`Failed to start recursion: ${error.message}`);
            this.setControlsState('idle');
        }
    }

    validateParameter() {
        if (this.currentAlgorithm === 'reverse') {
            if (!this.currentParameter || this.currentParameter.length === 0) {
                Utils.showError('Please enter a string to reverse');
                return false;
            }
        } else {
            if (this.currentParameter < 1) {
                Utils.showError('Parameter must be at least 1');
                return false;
            }
            if (this.currentAlgorithm === 'tower' && this.currentParameter > 5) {
                Utils.showError('For Tower of Hanoi, use 5 disks or less for better visualization');
                return false;
            }
            if (this.currentParameter > 10) {
                Utils.showError('Parameter too large (max 10)');
                return false;
            }
        }
        return true;
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
        this.updateCallStack(null);
        this.draw();
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
                startBtn.innerHTML = '<i data-feather="play" class="feather-sm me-1"></i>Start Recursion';
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

    draw(step = null) {
        if (!this.canvas) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        CanvasUtils.clearCanvas(ctx, width, height);

        if (!step) {
            this.drawIdleState(ctx, width, height);
            return;
        }

        switch (this.currentAlgorithm) {
            case 'factorial':
                this.drawFactorial(ctx, width, height, step);
                break;
            case 'fibonacci':
                this.drawFibonacci(ctx, width, height, step);
                break;
            case 'tower':
                this.drawTowerOfHanoi(ctx, width, height, step);
                break;
            case 'reverse':
                this.drawReverseString(ctx, width, height, step);
                break;
        }
    }

    drawIdleState(ctx, width, height) {
        const message = 'Select an algorithm and click Start to visualize recursion';
        CanvasUtils.drawText(ctx, message, width/2, height/2, ColorScheme.textLight, '16px Arial');
    }

    drawFactorial(ctx, width, height, step) {
        const centerX = width / 2;
        const startY = 50;
        const boxHeight = 50;
        const boxWidth = 120;
        const spacing = 60;

        // Draw call stack boxes
        if (step.call_stack) {
            step.call_stack.forEach((call, index) => {
                const y = startY + index * spacing;
                const isActive = index === step.call_stack.length - 1;
                
                let color = ColorScheme.default;
                if (isActive) {
                    color = step.type === 'base_case' ? ColorScheme.warning : ColorScheme.primary;
                } else if (step.type === 'return' && step.result !== undefined) {
                    color = ColorScheme.success;
                }

                // Draw box
                CanvasUtils.drawRect(ctx, centerX - boxWidth/2, y, boxWidth, boxHeight, color);
                
                // Draw call text
                CanvasUtils.drawText(ctx, call, centerX, y + 20, ColorScheme.text, '14px Arial');
                
                // Draw result if available
                if (step.type === 'return' && step.result !== undefined && step.n && index === step.call_stack.length - 1) {
                    CanvasUtils.drawText(ctx, `= ${step.result}`, centerX, y + 35, ColorScheme.text, '12px Arial');
                }
            });
        }

        // Draw arrows between calls
        if (step.call_stack && step.call_stack.length > 1) {
            for (let i = 0; i < step.call_stack.length - 1; i++) {
                const y1 = startY + i * spacing + boxHeight;
                const y2 = startY + (i + 1) * spacing;
                CanvasUtils.drawLine(ctx, centerX, y1, centerX, y2, ColorScheme.textLight);
            }
        }
    }

    drawFibonacci(ctx, width, height, step) {
        // Similar to factorial but with branching structure
        this.drawFactorial(ctx, width, height, step);
        
        // Add fibonacci-specific visualization if needed
        if (step.type === 'return' && step.result !== undefined) {
            const resultText = `fib(${step.n}) = ${step.result}`;
            CanvasUtils.drawText(ctx, resultText, width/2, height - 30, ColorScheme.success, '16px Arial');
        }
    }

    drawTowerOfHanoi(ctx, width, height, step) {
        const rodWidth = 8;
        const rodHeight = 180;
        const baseY = height - 80;
        const rodSpacing = width / 4;
        const diskHeight = 20;
        const maxDiskWidth = 80;
        
        // Colors for different disk sizes
        const diskColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'];
        
        // Draw the three rods
        const rods = ['A', 'B', 'C'];
        rods.forEach((rod, index) => {
            const x = rodSpacing * (index + 1);
            
            // Draw rod pole
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(x - rodWidth/2, baseY - rodHeight, rodWidth, rodHeight);
            
            // Draw base
            ctx.fillStyle = '#343a40';
            ctx.fillRect(x - 50, baseY, 100, 15);
            
            // Draw label
            ctx.fillStyle = '#007bff';
            ctx.font = 'bold 18px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(rod, x, baseY + 35);
            
            // Draw disks if we have rod state information
            if (step && step.rod_states && step.rod_states[rod]) {
                const disks = step.rod_states[rod];
                disks.forEach((diskSize, diskIndex) => {
                    const diskWidth = (diskSize / this.currentParameter) * maxDiskWidth;
                    const diskY = baseY - 15 - (diskIndex * (diskHeight + 2));
                    
                    // Use different color for each disk size
                    ctx.fillStyle = diskColors[(diskSize - 1) % diskColors.length];
                    
                    // Draw disk with rounded corners
                    const diskX = x - diskWidth/2;
                    this.drawRoundedRect(ctx, diskX, diskY, diskWidth, diskHeight, 10);
                    
                    // Draw disk number
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 12px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText(diskSize.toString(), x, diskY + diskHeight/2 + 4);
                });
            }
        });
        
        // Draw current action description
        if (step && step.description) {
            ctx.fillStyle = '#495057';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(step.description, width/2, 40);
        }
        
        // Highlight moving disk if it's a move step
        if (step && step.type === 'move' && step.source && step.destination) {
            const sourceIndex = rods.indexOf(step.source);
            const destIndex = rods.indexOf(step.destination);
            
            if (sourceIndex !== -1 && destIndex !== -1) {
                const sourceX = rodSpacing * (sourceIndex + 1);
                const destX = rodSpacing * (destIndex + 1);
                
                // Draw arrow indicating movement
                this.drawArrow(ctx, sourceX, baseY - rodHeight - 20, destX, baseY - rodHeight - 20, '#ff6b6b');
                
                ctx.fillStyle = '#ff6b6b';
                ctx.font = 'bold 14px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(`Moving disk ${step.disk}`, width/2, baseY - rodHeight - 35);
            }
        }
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    drawArrow(ctx, fromX, fromY, toX, toY, color) {
        const headlen = 10;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    drawReverseString(ctx, width, height, step) {
        const centerX = width / 2;
        const startY = 50;
        const boxHeight = 40;
        const spacing = 50;

        if (step.call_stack) {
            step.call_stack.forEach((call, index) => {
                const y = startY + index * spacing;
                const isActive = index === step.call_stack.length - 1;
                
                let color = ColorScheme.default;
                if (isActive) {
                    color = step.type === 'base_case' ? ColorScheme.warning : ColorScheme.primary;
                } else if (step.type === 'return') {
                    color = ColorScheme.success;
                }

                // Draw call representation
                CanvasUtils.drawText(ctx, call, centerX, y + 20, ColorScheme.text, '14px Arial');
            });
        }

        // Show current string being processed
        if (step.string) {
            CanvasUtils.drawText(ctx, `String: "${step.string}"`, centerX, height - 80, ColorScheme.info, '14px Arial');
        }

        // Show result if available
        if (step.result) {
            CanvasUtils.drawText(ctx, `Result: "${step.result}"`, centerX, height - 50, ColorScheme.success, '16px Arial');
        }
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

    updateCallStack(step) {
        const callStackElement = document.getElementById('callStack');
        if (!callStackElement) return;

        if (!step || !step.call_stack) {
            callStackElement.innerHTML = '<div class="text-muted">Start recursion to see call stack</div>';
            return;
        }

        const stackHtml = step.call_stack.map((call, index) => {
            const isTop = index === step.call_stack.length - 1;
            const className = isTop ? 'call-stack-item active' : 'call-stack-item';
            return `<div class="${className}">${call}</div>`;
        }).reverse().join('');

        callStackElement.innerHTML = stackHtml || '<div class="text-muted">Empty stack</div>';
    }

    updateAlgorithmInfo() {
        const infoElement = document.getElementById('algorithmInfo');
        if (!infoElement) return;

        const algorithmInfos = {
            factorial: {
                title: 'Factorial',
                description: 'Calculates n! = n × (n-1) × ... × 1',
                baseCase: 'factorial(0) = factorial(1) = 1',
                recursiveCase: 'factorial(n) = n × factorial(n-1)'
            },
            fibonacci: {
                title: 'Fibonacci',
                description: 'Calculates the nth Fibonacci number',
                baseCase: 'fib(0) = 0, fib(1) = 1',
                recursiveCase: 'fib(n) = fib(n-1) + fib(n-2)'
            },
            tower: {
                title: 'Tower of Hanoi',
                description: 'Moves n disks from source to destination',
                baseCase: 'Move single disk directly',
                recursiveCase: 'Move n-1, move base, move n-1'
            },
            reverse: {
                title: 'Reverse String',
                description: 'Reverses a string using recursion',
                baseCase: 'Empty or single character returns itself',
                recursiveCase: 'reverse(rest) + first_char'
            }
        };

        const info = algorithmInfos[this.currentAlgorithm];
        if (info) {
            infoElement.innerHTML = `
                <div class="mb-2">
                    <strong>${info.title}:</strong>
                    <div class="text-muted">${info.description}</div>
                </div>
                <div class="mb-2">
                    <strong>Base Case:</strong>
                    <div class="text-muted">${info.baseCase}</div>
                </div>
                <div class="mb-2">
                    <strong>Recursive Case:</strong>
                    <div class="text-muted">${info.recursiveCase}</div>
                </div>
            `;
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
                if (step.pseudocode_line.includes('return') || step.pseudocode_line.includes('=')) {
                    if (line.includes('return') || (line.includes('=') && !line.includes('=='))) {
                        return `<span class="pseudocode-highlight">${line}</span>`;
                    }
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
            factorial: { time: 'O(n)', space: 'O(n)' },
            fibonacci: { time: 'O(2^n)', space: 'O(n)' },
            tower: { time: 'O(2^n)', space: 'O(n)' },
            reverse: { time: 'O(n)', space: 'O(n)' }
        };

        const complexity = complexities[this.currentAlgorithm];
        const complexityInfoElement = document.getElementById('complexityInfo');
        
        if (complexity && complexityInfoElement) {
            complexityInfoElement.innerHTML = `
                <div class="complexity-badge complexity-time mb-2">Time: ${complexity.time}</div>
                <div class="complexity-badge complexity-space">Space: ${complexity.space}</div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecursionVisualizer();
});
