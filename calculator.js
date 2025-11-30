// calculator.js ~ main calculator class with state management

class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.historyDisplay = document.getElementById('history-display');
        this.historyList = document.getElementById('history-list');
        this.memoryIndicator = document.getElementById('memory-indicator');

        this.currentInput = '0';
        this.memory = 0;
        this.hasMemory = false;
        this.history = [];
        this.lastResult = null;
        this.isNewCalculation = true;

        this.maxHistoryItems = 50;
        this.loadHistory();
        this.setupKeyboardListener();
    }

    // display management
    updateDisplay() {
        this.display.value = this.currentInput;
    }

    updateHistoryDisplay(text = '') {
        this.historyDisplay.textContent = text;
    }

    updateMemoryIndicator() {
        if (this.hasMemory) {
            this.memoryIndicator.classList.add('active');
        } else {
            this.memoryIndicator.classList.remove('active');
        }
    }

    // input methods
    appendDigit(digit) {
        if (this.isNewCalculation) {
            this.currentInput = digit;
            this.isNewCalculation = false;
        } else if (this.currentInput === '0' && digit !== '0') {
            this.currentInput = digit;
        } else if (this.currentInput !== '0' || digit !== '0') {
            this.currentInput += digit;
        }
        this.updateDisplay();
    }

    appendDecimal() {
        // get the last number in the expression
        const parts = this.currentInput.split(/[+\-*/^%()]/);
        const lastPart = parts[parts.length - 1];

        if (this.isNewCalculation) {
            this.currentInput = '0.';
            this.isNewCalculation = false;
        } else if (!lastPart.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    appendOperator(op) {
        const lastChar = this.currentInput.slice(-1);
        const operators = ['+', '-', '*', '/', '^', '%'];

        if (this.isNewCalculation && this.lastResult !== null) {
            this.currentInput = String(this.lastResult);
            this.isNewCalculation = false;
        }

        // replace last operator if one exists
        if (operators.includes(lastChar)) {
            this.currentInput = this.currentInput.slice(0, -1) + op;
        } else if (this.currentInput !== '' && lastChar !== '(') {
            this.currentInput += op;
        }

        this.updateDisplay();
    }

    appendFunction(func) {
        if (this.isNewCalculation) {
            this.currentInput = func + '(';
            this.isNewCalculation = false;
        } else {
            const lastChar = this.currentInput.slice(-1);
            if (/[0-9)π]/.test(lastChar)) {
                this.currentInput += '*' + func + '(';
            } else {
                this.currentInput += func + '(';
            }
        }
        this.updateDisplay();
    }

    appendConstant(constant) {
        if (this.isNewCalculation) {
            this.currentInput = constant;
            this.isNewCalculation = false;
        } else {
            const lastChar = this.currentInput.slice(-1);
            if (/[0-9)π]/.test(lastChar)) {
                this.currentInput += '*' + constant;
            } else {
                this.currentInput += constant;
            }
        }
        this.updateDisplay();
    }

    appendParenthesis(paren) {
        if (this.isNewCalculation && paren === '(') {
            this.currentInput = '(';
            this.isNewCalculation = false;
        } else {
            const lastChar = this.currentInput.slice(-1);

            if (paren === '(') {
                if (/[0-9)π]/.test(lastChar)) {
                    this.currentInput += '*(';
                } else {
                    this.currentInput += '(';
                }
            } else {
                // count open and close parentheses
                const openCount = (this.currentInput.match(/\(/g) || []).length;
                const closeCount = (this.currentInput.match(/\)/g) || []).length;

                if (openCount > closeCount && !/[+\-*/^%(]/.test(lastChar)) {
                    this.currentInput += ')';
                }
            }
        }
        this.updateDisplay();
    }

    // clear methods
    clearAll() {
        this.currentInput = '0';
        this.isNewCalculation = true;
        this.updateDisplay();
        this.updateHistoryDisplay();
    }

    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }

    // calculation
    calculate() {
        try {
            // auto-close parentheses
            let expr = this.currentInput;
            const openCount = (expr.match(/\(/g) || []).length;
            const closeCount = (expr.match(/\)/g) || []).length;
            expr += ')'.repeat(openCount - closeCount);

            const result = parser.evaluate(expr);

            // format result
            let formattedResult;
            if (Number.isInteger(result) && Math.abs(result) < 1e15) {
                formattedResult = result.toString();
            } else if (Math.abs(result) < 0.0001 || Math.abs(result) >= 1e10) {
                formattedResult = result.toExponential(6);
            } else {
                formattedResult = parseFloat(result.toPrecision(10)).toString();
            }

            // add to history
            this.addToHistory(this.currentInput, formattedResult);

            // update display
            this.updateHistoryDisplay(this.currentInput + ' =');
            this.lastResult = result;
            this.currentInput = formattedResult;
            this.isNewCalculation = true;
            this.updateDisplay();

        } catch (error) {
            this.currentInput = 'Error';
            this.updateDisplay();
            this.isNewCalculation = true;
            console.error('Calculation error:', error.message);
        }
    }

    // memory Functions
    memoryClear() {
        this.memory = 0;
        this.hasMemory = false;
        this.updateMemoryIndicator();
    }

    memoryRecall() {
        if (this.hasMemory) {
            if (this.isNewCalculation) {
                this.currentInput = String(this.memory);
                this.isNewCalculation = false;
            } else {
                this.currentInput += String(this.memory);
            }
            this.updateDisplay();
        }
    }

    memoryAdd() {
        try {
            const value = parser.evaluate(this.currentInput);
            this.memory += value;
            this.hasMemory = true;
            this.updateMemoryIndicator();
            this.isNewCalculation = true;
        } catch (error) {
            console.error('Memory add error:', error.message);
        }
    }

    memorySubtract() {
        try {
            const value = parser.evaluate(this.currentInput);
            this.memory -= value;
            this.hasMemory = true;
            this.updateMemoryIndicator();
            this.isNewCalculation = true;
        } catch (error) {
            console.error('Memory subtract error:', error.message);
        }
    }

    // history management
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toISOString()
        };

        this.history.unshift(historyItem);

        // limit history size
        if (this.history.length > this.maxHistoryItems) {
            this.history.pop();
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        this.historyList.innerHTML = '';

        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-item"><span class="expression">No history yet</span></div>';
            return;
        }

        this.history.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="expression">${this.escapeHtml(item.expression)}</div>
                <div class="result">= ${this.escapeHtml(item.result)}</div>
            `;
            div.onclick = () => this.loadFromHistory(index);
            this.historyList.appendChild(div);
        });
    }

    loadFromHistory(index) {
        const item = this.history[index];
        this.currentInput = item.result;
        this.isNewCalculation = true;
        this.updateDisplay();
        this.updateHistoryDisplay(item.expression + ' =');
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Could not save history to localStorage');
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('calculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load history from localStorage');
        }
        this.renderHistory();
    }

    // utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // keyboard support
    setupKeyboardListener() {
        document.addEventListener('keydown', (e) => {
            // prevent default for calculator keys
            if (e.key === 'Enter' || e.key === '=' || e.key === 'Escape' || 
                e.key === 'Backspace' || /^[0-9+\-*/.()%^]$/.test(e.key)) {
                e.preventDefault();
            }

            // number keys
            if (/^[0-9]$/.test(e.key)) {
                this.appendDigit(e.key);
            }
            // operators
            else if (['+', '-', '*', '/', '%', '^'].includes(e.key)) {
                this.appendOperator(e.key);
            }
            // decimal
            else if (e.key === '.') {
                this.appendDecimal();
            }
            // parentheses
            else if (e.key === '(') {
                this.appendParenthesis('(');
            }
            else if (e.key === ')') {
                this.appendParenthesis(')');
            }
            // calculate
            else if (e.key === 'Enter' || e.key === '=') {
                this.calculate();
            }
            // clear
            else if (e.key === 'Escape') {
                this.clearAll();
            }
            // backspace
            else if (e.key === 'Backspace') {
                this.backspace();
            }
        });
    }
}