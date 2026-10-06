// Anime Calculator - Main Logic
class AnimeCalculator {
    constructor() {
        this.currentMode = 'basic';
        this.angleMode = 'DEG'; // DEG or RAD
        this.expression = '';
        this.history = [];
        this.result = '0';
        this.waitingForOperand = false;
        this.lastOperator = null;
        this.lastValue = null;
        
        this.initElements();
        this.bindEvents();
        this.createParticles();
        this.loadHistory();
        this.updateDisplay();
    }

    initElements() {
        this.expressionDisplay = document.getElementById('expressionDisplay');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.modeIndicator = document.getElementById('modeIndicator');
        this.modeTabs = document.querySelectorAll('.mode-tab');
        this.keypads = {
            basic: document.getElementById('basicKeypad'),
            scientific: document.getElementById('scientificKeypad'),
            calculus: document.getElementById('calculusKeypad')
        };
        this.angleModeBtns = document.querySelectorAll('.angle-toggle');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.historyBtn = document.getElementById('historyBtn');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.clickSound = document.getElementById('clickSound');
        this.powerSound = document.getElementById('powerSound');
        this.powerUpEl = document.getElementById('powerUp');
    }

    bindEvents() {
        // Key clicks
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', (e) => this.handleKeyClick(e));
        });

        // Mode tabs
        this.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchMode(tab.dataset.mode));
        });

        // History
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const colors = ['#00d4ff', '#ff2d95', '#ffd700', '#00ff88', '#ff6b35'];
        
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (6 + Math.random() * 4) + 's';
            particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';
            particlesContainer.appendChild(particle);
        }
    }

    handleKeyClick(e) {
        const key = e.currentTarget;
        this.createRipple(key, e);
        this.playClickSound();
        
        const action = key.dataset.action;
        const value = key.dataset.value;

        if (action) {
            this.handleAction(action);
        } else if (value !== undefined) {
            this.inputNumber(value);
        }
        
        this.updateDisplay();
    }

    createRipple(key, e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = key.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        key.appendChild(ripple);
        setTimeout(() => ripple.remove(), 400);
    }

    playClickSound() {
        this.clickSound.currentTime = 0;
        this.clickSound.volume = 0.25;
        this.clickSound.play().catch(() => {});
    }

    playPowerSound() {
        this.powerSound.currentTime = 0;
        this.powerSound.volume = 0.35;
        this.powerSound.play().catch(() => {});
    }

    showPowerUp(x, y) {
        this.powerUpEl.style.left = x + 'px';
        this.powerUpEl.style.top = y + 'px';
        this.powerUpEl.style.opacity = '1';
        this.powerUpEl.style.transform = 'translate(-50%, -50%) scale(0)';
        this.powerUpEl.style.animation = 'none';
        void this.powerUpEl.offsetWidth;
        this.powerUpEl.style.animation = 'powerUpAnim 0.6s ease-out forwards';
        this.playPowerSound();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
            case 'power':
                this.inputOperator(action);
                break;
            case 'percent':
                this.inputPercent();
                break;
            case 'negate':
                this.negate();
                break;
            case 'pi':
                this.inputConstant(Math.PI);
                break;
            case 'toggleAngleMode':
                this.toggleAngleMode();
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'asin':
            case 'acos':
            case 'atan':
            case 'log':
            case 'ln':
            case 'exp':
            case 'sqrt':
            case 'cbrt':
            case 'factorial':
                this.inputFunction(action);
                break;
            case 'derivative':
            case 'integral':
            case 'limit':
            case 'taylor':
                this.inputCalculus(action);
                break;
            case 'variable':
                this.inputNumber('x');
                break;
        }
    }

    handleKeyboard(e) {
        const keyMap = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
            '.': '.', '+': 'add', '-': 'subtract', '*': 'multiply',
            '/': 'divide', 'Enter': 'equals', '=': 'equals',
            'Escape': 'clear', 'Backspace': 'delete', '%': 'percent',
        };

        if (keyMap[e.key]) {
            e.preventDefault();
            const action = keyMap[e.key];
            if (['add', 'subtract', 'multiply', 'divide', 'equals', 'clear', 'delete', 'percent'].includes(action)) {
                this.handleAction(action);
            } else {
                this.inputNumber(action);
            }
            this.updateDisplay();
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tabs
        this.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Update keypads
        Object.values(this.keypads).forEach(k => k.classList.remove('active'));
        this.keypads[mode].classList.add('active');

        // Update mode indicator
        if (mode === 'scientific' || mode === 'calculus') {
            this.modeIndicator.textContent = this.angleMode;
        } else {
            this.modeIndicator.textContent = 'BASIC';
        }
    }

    toggleAngleMode() {
        this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
        this.updateAngleModeButtons();
        this.modeIndicator.textContent = this.angleMode;
        this.updateDisplay();
    }

    updateAngleModeButtons() {
        this.angleModeBtns.forEach(btn => {
            btn.textContent = this.angleMode;
        });
    }

    // Basic Operations
    clear() {
        this.expression = '';
        this.result = '0';
        this.waitingForOperand = false;
        this.lastOperator = null;
        this.lastValue = null;
    }

    delete() {
        if (this.result !== '0' && this.result !== 'Error') {
            this.result = this.result.slice(0, -1);
            if (this.result === '' || this.result === '-') this.result = '0';
        } else if (this.expression) {
            this.expression = this.expression.slice(0, -1).trim();
            if (this.expression.endsWith(' ')) this.expression = this.expression.slice(0, -1);
        }
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.result = num === '.' ? '0.' : num;
            this.waitingForOperand = false;
        } else {
            if (num === '.' && this.result.includes('.')) return;
            if (num === 'x') {
                this.result = 'x';
            } else if (this.result === '0' && num !== '.') {
                this.result = num;
            } else {
                this.result += num;
            }
        }
    }

    inputOperator(op) {
        const operators = { add: '+', subtract: '-', multiply: '×', divide: '÷', power: '^' };
        const symbol = operators[op];
        
        if (this.lastOperator && !this.waitingForOperand) {
            this.calculate();
        }
        
        this.expression = (this.expression ? this.expression + ' ' : '') + this.result + ' ' + symbol;
        this.lastOperator = op;
        const val = this.parseValue(this.result);
        this.lastValue = isNaN(val) ? 0 : val;
        this.waitingForOperand = true;
    }

    parseValue(str) {
        if (str === 'x' || str.includes('x')) return NaN;
        return parseFloat(str);
    }

    inputPercent() {
        if (this.result !== '0' && this.result !== 'Error' && !this.result.includes('x')) {
            this.result = (parseFloat(this.result) / 100).toString();
        }
    }

    negate() {
        if (this.result !== '0' && this.result !== 'Error' && !this.result.includes('x')) {
            if (this.result.startsWith('-')) {
                this.result = this.result.slice(1);
            } else {
                this.result = '-' + this.result;
            }
        }
    }

    inputConstant(value) {
        if (this.waitingForOperand || this.result === '0') {
            this.result = this.formatNumber(value);
            this.waitingForOperand = false;
        } else {
            this.result += this.formatNumber(value);
        }
    }

    // Scientific Functions
    inputFunction(func) {
        const funcNames = {
            sin: 'sin', cos: 'cos', tan: 'tan',
            asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹',
            log: 'log', ln: 'ln', exp: 'e^',
            sqrt: '√', cbrt: '∛', factorial: '!'
        };

        const name = funcNames[func];
        let val = this.parseValue(this.result);
        
        if (isNaN(val)) {
            this.result = 'Error';
            this.updateDisplay();
            return;
        }

        try {
            let result;
            const angle = this.angleMode === 'DEG' ? val * Math.PI / 180 : val;

            switch (func) {
                case 'sin': result = Math.sin(angle); break;
                case 'cos': result = Math.cos(angle); break;
                case 'tan': result = Math.tan(angle); break;
                case 'asin': 
                    if (val < -1 || val > 1) throw new Error('Domain error');
                    result = this.angleMode === 'DEG' ? Math.asin(val) * 180 / Math.PI : Math.asin(val); 
                    break;
                case 'acos': 
                    if (val < -1 || val > 1) throw new Error('Domain error');
                    result = this.angleMode === 'DEG' ? Math.acos(val) * 180 / Math.PI : Math.acos(val); 
                    break;
                case 'atan': 
                    result = this.angleMode === 'DEG' ? Math.atan(val) * 180 / Math.PI : Math.atan(val); 
                    break;
                case 'log': 
                    if (val <= 0) throw new Error('Domain error');
                    result = Math.log10(val); 
                    break;
                case 'ln': 
                    if (val <= 0) throw new Error('Domain error');
                    result = Math.log(val); 
                    break;
                case 'exp': result = Math.exp(val); break;
                case 'sqrt': 
                    if (val < 0) throw new Error('Domain error');
                    result = Math.sqrt(val); 
                    break;
                case 'cbrt': result = Math.cbrt(val); break;
                case 'factorial': result = this.factorial(val); break;
            }

            if (isNaN(result) || !isFinite(result)) {
                this.result = 'Error';
            } else {
                this.expression = name + '(' + this.result + ')';
                this.result = this.formatNumber(result);
                this.waitingForOperand = true;
                this.addToHistory(this.expression, this.result);
            }
        } catch (e) {
            this.result = 'Error';
        }
    }

    factorial(n) {
        if (n < 0 || n !== Math.floor(n)) return NaN;
        if (n > 170) return Infinity;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }

    // Calculus Functions
    inputCalculus(calc) {
        const names = {
            derivative: 'd/dx', integral: '∫', limit: 'lim', taylor: 'Taylor'
        };
        
        const exprStr = this.result;
        this.expression = names[calc] + '(' + exprStr + ')';
        
        try {
            let result;
            
            switch (calc) {
                case 'derivative':
                    result = this.numericalDerivative(exprStr);
                    break;
                case 'integral':
                    // For indefinite integral, we approximate definite integral from 0 to 1
                    // and show it as the antiderivative evaluated at 1
                    result = this.numericalIntegral(exprStr, 0, 1);
                    break;
                case 'limit':
                    result = this.numericalLimit(exprStr);
                    break;
                case 'taylor':
                    result = this.taylorSeries(exprStr);
                    break;
            }
            
            this.result = this.formatNumber(result);
            this.waitingForOperand = true;
            this.addToHistory(this.expression, this.result);
        } catch (e) {
            console.error('Calculus error:', e);
            this.result = 'Error';
        }
    }

    // Numerical Methods for Calculus
    createFunction(expr) {
        // Replace mathematical notation with JS equivalents
        let jsExpr = expr
            .replace(/\^/g, '**')
            .replace(/x/g, 'x')
            .replace(/π|pi/gi, 'Math.PI')
            .replace(/e\^/g, 'Math.exp')
            .replace(/√/g, 'Math.sqrt')
            .replace(/∛/g, 'Math.cbrt')
            .replace(/sin⁻¹/g, 'Math.asin')
            .replace(/cos⁻¹/g, 'Math.acos')
            .replace(/tan⁻¹/g, 'Math.atan')
            .replace(/sin/g, 'Math.sin')
            .replace(/cos/g, 'Math.cos')
            .replace(/tan/g, 'Math.tan')
            .replace(/log/g, 'Math.log10')
            .replace(/ln/g, 'Math.log')
            .replace(/exp/g, 'Math.exp');
        
        // Handle factorial - replace x! with factorial function call
        jsExpr = jsExpr.replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)');
        
        try {
            return new Function('x', 'factorial', 'return ' + jsExpr);
        } catch (e) {
            console.error('Function creation failed:', jsExpr, e);
            return (x) => NaN;
        }
    }

    numericalDerivative(expr) {
        const x = 1; // Evaluate at x=1 as a reasonable default
        const h = 1e-7;
        const f = this.createFunction(expr);
        const f1 = f(x + h, this.factorial);
        const f2 = f(x - h, this.factorial);
        
        if (isNaN(f1) || isNaN(f2)) throw new Error('Invalid function');
        return (f1 - f2) / (2 * h);
    }

    numericalIntegral(expr, a = 0, b = 1) {
        const f = this.createFunction(expr);
        const n = 2000;
        const h = (b - a) / n;
        let sum = 0;
        
        for (let i = 0; i < n; i++) {
            const x1 = a + i * h;
            const x2 = a + (i + 1) * h;
            const f1 = f(x1, this.factorial);
            const f2 = f(x2, this.factorial);
            
            if (isNaN(f1) || isNaN(f2)) throw new Error('Invalid function');
            sum += (f1 + f2) * h / 2; // Trapezoidal rule
        }
        return sum;
    }

    numericalLimit(expr) {
        const f = this.createFunction(expr);
        const h = 1e-7;
        const result = f(h, this.factorial); // Limit as x -> 0
        if (isNaN(result)) throw new Error('Limit does not exist');
        return result;
    }

    taylorSeries(expr) {
        // Taylor series of f(x) around 0, evaluated at x=1
        // f(0) + f'(0)*1 + f''(0)*1^2/2! + f'''(0)*1^3/3! + ...
        const f = this.createFunction(expr);
        const x = 0;
        const n = 8;
        
        let sum = f(x, this.factorial.bind(this));
        if (isNaN(sum)) throw new Error('Invalid function');
        
        // Compute derivatives at 0 numerically using central difference
        for (let i = 1; i <= n; i++) {
            const h = 1e-4;
            const deriv = this.nthDerivativeAtZero(f, i, h);
            if (isNaN(deriv) || !isFinite(deriv)) break;
            const term = deriv * Math.pow(1, i) / this.factorial(i);
            sum += term;
        }
        return sum;
    }

    nthDerivativeAtZero(f, n, h) {
        if (n === 1) {
            return (f(h, this.factorial.bind(this)) - f(-h, this.factorial.bind(this))) / (2 * h);
        }
        // Use Richardson extrapolation for better accuracy
        // For n > 1, compute using symmetric differences
        const fPlus = (x) => f(x, this.factorial.bind(this));
        // Second derivative: (f(h) - 2f(0) + f(-h)) / h^2
        if (n === 2) {
            return (fPlus(h) - 2 * fPlus(0) + fPlus(-h)) / (h * h);
        }
        // For higher orders, use recursive central difference
        return (this.nthDerivativeAtZero(f, n - 1, h + h) - this.nthDerivativeAtZero(f, n - 1, h - h)) / (2 * h);
    }

    calculate() {
        if (!this.lastOperator || this.waitingForOperand) return;

        const currentValue = this.parseValue(this.result);
        if (isNaN(currentValue)) {
            this.result = 'Error';
            return;
        }

        let result;

        try {
            switch (this.lastOperator) {
                case 'add': result = this.lastValue + currentValue; break;
                case 'subtract': result = this.lastValue - currentValue; break;
                case 'multiply': result = this.lastValue * currentValue; break;
                case 'divide': 
                    if (currentValue === 0) throw new Error('Division by zero');
                    result = this.lastValue / currentValue; 
                    break;
                case 'power': result = Math.pow(this.lastValue, currentValue); break;
            }

            this.expression += ' ' + this.result;
            this.result = this.formatNumber(result);
            this.addToHistory(this.expression, this.result);
            
            this.lastOperator = null;
            this.lastValue = null;
            this.waitingForOperand = true;
        } catch (e) {
            this.result = 'Error';
        }
    }

    formatNumber(num) {
        if (num === Infinity) return '∞';
        if (num === -Infinity) return '-∞';
        if (isNaN(num)) return 'Error';
        
        // Handle very large/small numbers
        if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-10 && num !== 0)) {
            return num.toExponential(6);
        }
        
        // Round to avoid floating point errors
        const rounded = Math.round(num * 1e12) / 1e12;
        
        // Handle -0
        if (rounded === 0) return '0';
        
        return rounded.toString();
    }

    updateDisplay() {
        this.expressionDisplay.textContent = this.expression;
        this.resultDisplay.textContent = this.result;
        
        if (this.result === 'Error') {
            this.resultDisplay.classList.add('error');
        } else {
            this.resultDisplay.classList.remove('error');
        }
    }

    addToHistory(expr, result) {
        const entry = { expr, result, timestamp: Date.now() };
        this.history.unshift(entry);
        if (this.history.length > 50) this.history.pop();
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-expr="${this.escapeHtml(item.expr)}" data-result="${this.escapeHtml(item.result)}">
                <span class="history-expression">${this.escapeHtml(item.expr)}</span>
                <span class="history-result">${this.escapeHtml(item.result)}</span>
            </div>
        `).join('');

        // Add click handlers
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                this.result = item.dataset.result;
                this.expression = '';
                this.waitingForOperand = true;
                this.updateDisplay();
                this.toggleHistory();
            });
        });
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('open');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('animeCalcHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('animeCalcHistory');
        if (saved) {
            try {
                this.history = JSON.parse(saved);
                this.renderHistory();
            } catch (e) {
                this.history = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new AnimeCalculator();
});