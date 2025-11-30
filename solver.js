// solver.js ~ equation solver module

class EquationSolver {
    constructor() {
        this.typeSelect = document.getElementById('equation-type');
        this.inputsDiv = document.getElementById('solver-inputs');
        this.resultDiv = document.getElementById('solver-result');

        this.initialize();
    }

    initialize() {
        this.changeType();
    }

    changeType() {
        const type = this.typeSelect.value;
        this.resultDiv.innerHTML = '';

        switch (type) {
            case 'linear':
                this.setupLinearInputs();
                break;
            case 'quadratic':
                this.setupQuadraticInputs();
                break;
            case 'system':
                this.setupSystemInputs();
                break;
        }
    }

    setupLinearInputs() {
        this.inputsDiv.innerHTML = `
            <div style="color: #888; font-size: 12px; margin-bottom: 10px;">
                Solve: ax + b = 0
            </div>
            <input type="number" id="linear-a" placeholder="a (coefficient of x)" step="any">
            <input type="number" id="linear-b" placeholder="b (constant)" step="any">
        `;
    }

    setupQuadraticInputs() {
        this.inputsDiv.innerHTML = `
            <div style="color: #888; font-size: 12px; margin-bottom: 10px;">
                Solve: ax² + bx + c = 0
            </div>
            <input type="number" id="quad-a" placeholder="a (coefficient of x²)" step="any">
            <input type="number" id="quad-b" placeholder="b (coefficient of x)" step="any">
            <input type="number" id="quad-c" placeholder="c (constant)" step="any">
        `;
    }

    setupSystemInputs() {
        this.inputsDiv.innerHTML = `
            <div style="color: #888; font-size: 12px; margin-bottom: 10px;">
                Solve system:<br>
                a₁x + b₁y = c₁<br>
                a₂x + b₂y = c₂
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;">
                <input type="number" id="sys-a1" placeholder="a₁" step="any">
                <input type="number" id="sys-b1" placeholder="b₁" step="any">
                <input type="number" id="sys-c1" placeholder="c₁" step="any">
                <input type="number" id="sys-a2" placeholder="a₂" step="any">
                <input type="number" id="sys-b2" placeholder="b₂" step="any">
                <input type="number" id="sys-c2" placeholder="c₂" step="any">
            </div>
        `;
    }

    solve() {
        const type = this.typeSelect.value;

        try {
            switch (type) {
                case 'linear':
                    this.solveLinear();
                    break;
                case 'quadratic':
                    this.solveQuadratic();
                    break;
                case 'system':
                    this.solveSystem();
                    break;
            }
        } catch (error) {
            this.resultDiv.innerHTML = `<span class="error">${error.message}</span>`;
        }
    }

    solveLinear() {
        const a = parseFloat(document.getElementById('linear-a').value);
        const b = parseFloat(document.getElementById('linear-b').value);

        if (isNaN(a) || isNaN(b)) {
            throw new Error('Please enter all coefficients');
        }

        if (a === 0) {
            if (b === 0) {
                this.resultDiv.innerHTML = '<span class="solution">Infinite solutions (0 = 0)</span>';
            } else {
                this.resultDiv.innerHTML = '<span class="error">No solution (contradiction)</span>';
            }
            return;
        }

        const x = -b / a;
        const formatted = this.formatNumber(x);

        this.resultDiv.innerHTML = `
            <div>Solution:</div>
            <div class="solution">x = ${formatted}</div>
        `;
    }

    solveQuadratic() {
        const a = parseFloat(document.getElementById('quad-a').value);
        const b = parseFloat(document.getElementById('quad-b').value);
        const c = parseFloat(document.getElementById('quad-c').value);

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            throw new Error('Please enter all coefficients');
        }

        if (a === 0) {
            // Degenerates to linear equation
            if (b === 0) {
                if (c === 0) {
                    this.resultDiv.innerHTML = '<span class="solution">Infinite solutions</span>';
                } else {
                    this.resultDiv.innerHTML = '<span class="error">No solution</span>';
                }
                return;
            }
            const x = -c / b;
            this.resultDiv.innerHTML = `
                <div>Linear equation (a=0):</div>
                <div class="solution">x = ${this.formatNumber(x)}</div>
            `;
            return;
        }

        const discriminant = b * b - 4 * a * c;

        if (discriminant > 0) {
            // two real solutions
            const sqrtD = Math.sqrt(discriminant);
            const x1 = (-b + sqrtD) / (2 * a);
            const x2 = (-b - sqrtD) / (2 * a);

            this.resultDiv.innerHTML = `
                <div>Two real solutions:</div>
                <div class="solution">x₁ = ${this.formatNumber(x1)}</div>
                <div class="solution">x₂ = ${this.formatNumber(x2)}</div>
                <div style="color: #888; font-size: 12px; margin-top: 10px;">
                    Discriminant: ${this.formatNumber(discriminant)}
                </div>
            `;
        } else if (discriminant === 0) {
            // one real solution (double root)
            const x = -b / (2 * a);

            this.resultDiv.innerHTML = `
                <div>One solution (double root):</div>
                <div class="solution">x = ${this.formatNumber(x)}</div>
                <div style="color: #888; font-size: 12px; margin-top: 10px;">
                    Discriminant: 0
                </div>
            `;
        } else {
            // complex solutions
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-discriminant) / (2 * a);

            this.resultDiv.innerHTML = `
                <div>Two complex solutions:</div>
                <div class="solution">x₁ = ${this.formatNumber(realPart)} + ${this.formatNumber(imagPart)}i</div>
                <div class="solution">x₂ = ${this.formatNumber(realPart)} - ${this.formatNumber(imagPart)}i</div>
                <div style="color: #888; font-size: 12px; margin-top: 10px;">
                    Discriminant: ${this.formatNumber(discriminant)}
                </div>
            `;
        }
    }

    solveSystem() {
        // using cramer's rule to solve system of linear equations
        const a1 = parseFloat(document.getElementById('sys-a1').value);
        const b1 = parseFloat(document.getElementById('sys-b1').value);
        const c1 = parseFloat(document.getElementById('sys-c1').value);
        const a2 = parseFloat(document.getElementById('sys-a2').value);
        const b2 = parseFloat(document.getElementById('sys-b2').value);
        const c2 = parseFloat(document.getElementById('sys-c2').value);

        if ([a1, b1, c1, a2, b2, c2].some(isNaN)) {
            throw new Error('Please enter all coefficients');
        }

        // calculate determinant of coefficient matrix
        const det = a1 * b2 - a2 * b1;

        if (det === 0) {
            // check if equations are dependent or inconsistent
            const detX = c1 * b2 - c2 * b1;
            const detY = a1 * c2 - a2 * c1;

            if (detX === 0 && detY === 0) {
                this.resultDiv.innerHTML = '<span class="solution">Infinite solutions (dependent equations)</span>';
            } else {
                this.resultDiv.innerHTML = '<span class="error">No solution (inconsistent system)</span>';
            }
            return;
        }

        // cramer's rule
        const detX = c1 * b2 - c2 * b1;
        const detY = a1 * c2 - a2 * c1;

        const x = detX / det;
        const y = detY / det;

        this.resultDiv.innerHTML = `
            <div>Unique solution:</div>
            <div class="solution">x = ${this.formatNumber(x)}</div>
            <div class="solution">y = ${this.formatNumber(y)}</div>
            <div style="color: #888; font-size: 12px; margin-top: 10px;">
                Determinant: ${this.formatNumber(det)}
            </div>
        `;
    }

    formatNumber(num) {
        if (Number.isInteger(num)) {
            return num.toString();
        }

        // check if it's a "nice" fraction
        const tolerance = 1e-10;
        for (let denom = 1; denom <= 1000; denom++) {
            const numer = Math.round(num * denom);
            if (Math.abs(num - numer / denom) < tolerance) {
                if (denom === 1) return numer.toString();
                // return decimal for simplicity
                break;
            }
        }

        return parseFloat(num.toPrecision(10)).toString();
    }
}