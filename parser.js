// parser.js ~ mathematical expression parser
// implements the shunting yard algo for proper operator precedence

class Token {
    constructor(type, value) {
        this.type = type;   // 'NUMBER', 'OPERATOR', 'FUNCTION', 'LPAREN', 'RPAREN', 'CONSTANT'
        this.value = value;
    }
}

class ExpressionParser {
    constructor() {
        this.operators = {
            '+': { precedence: 2, associativity: 'left' },
            '-': { precedence: 2, associativity: 'left' },
            '*': { precedence: 3, associativity: 'left' },
            '/': { precedence: 3, associativity: 'left' },
            '%': { precedence: 3, associativity: 'left' },
            '^': { precedence: 4, associativity: 'right' }
        };

        this.functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 
                          'log', 'ln', 'sqrt', 'cbrt', 'abs', 'exp'];

        this.constants = {
            'π': Math.PI,
            'pi': Math.PI,
            'e': Math.E
        };
    }

    tokenize(expression) {
        const tokens = [];
        let i = 0;
        const expr = expression.replace(/\s+/g, '');

        while (i < expr.length) {
            const char = expr[i];

            // check for numbers (including decimals)
            if (/[0-9.]/.test(char)) {
                let numStr = '';
                while (i < expr.length && /[0-9.]/.test(expr[i])) {
                    numStr += expr[i];
                    i++;
                }
                tokens.push(new Token('NUMBER', parseFloat(numStr)));
                continue;
            }

            // check for constants
            if (char === 'π' || char === 'e') {
                // check if 'e' is part of 'exp' function
                if (char === 'e' && expr.substr(i, 3) === 'exp') {
                    tokens.push(new Token('FUNCTION', 'exp'));
                    i += 3;
                    continue;
                }
                tokens.push(new Token('CONSTANT', char));
                i++;
                continue;
            }

            // check for functions
            let foundFunction = false;
            for (const func of this.functions) {
                if (expr.substr(i, func.length) === func) {
                    tokens.push(new Token('FUNCTION', func));
                    i += func.length;
                    foundFunction = true;
                    break;
                }
            }
            if (foundFunction) continue;

            // check for 'pi' constant
            if (expr.substr(i, 2) === 'pi') {
                tokens.push(new Token('CONSTANT', 'pi'));
                i += 2;
                continue;
            }

            // check for operators
            if (this.operators[char]) {
                // handle unary minus
                if (char === '-' && (tokens.length === 0 || 
                    tokens[tokens.length - 1].type === 'LPAREN' ||
                    tokens[tokens.length - 1].type === 'OPERATOR')) {
                    // unary minus ~ add 0 before it
                    tokens.push(new Token('NUMBER', 0));
                }
                tokens.push(new Token('OPERATOR', char));
                i++;
                continue;
            }

            // check for parentheses
            if (char === '(') {
                tokens.push(new Token('LPAREN', char));
                i++;
                continue;
            }

            if (char === ')') {
                tokens.push(new Token('RPAREN', char));
                i++;
                continue;
            }

            // unknown character ~ throw error
            throw new Error(`Unknown character: ${char}`);
        }

        return tokens;
    }

    // shunting yard algorithm ~ convert infix to postfix (RPN)
    toPostfix(tokens) {
        const outputQueue = [];
        const operatorStack = [];

        for (const token of tokens) {
            switch (token.type) {
                case 'NUMBER':
                case 'CONSTANT':
                    outputQueue.push(token);
                    break;

                case 'FUNCTION':
                    operatorStack.push(token);
                    break;

                case 'OPERATOR':
                    while (operatorStack.length > 0) {
                        const top = operatorStack[operatorStack.length - 1];

                        if (top.type === 'FUNCTION') {
                            outputQueue.push(operatorStack.pop());
                        } else if (top.type === 'OPERATOR') {
                            const topOp = this.operators[top.value];
                            const currentOp = this.operators[token.value];

                            if ((currentOp.associativity === 'left' && 
                                 currentOp.precedence <= topOp.precedence) ||
                                (currentOp.associativity === 'right' && 
                                 currentOp.precedence < topOp.precedence)) {
                                outputQueue.push(operatorStack.pop());
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    operatorStack.push(token);
                    break;

                case 'LPAREN':
                    operatorStack.push(token);
                    break;

                case 'RPAREN':
                    while (operatorStack.length > 0 && 
                           operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
                        outputQueue.push(operatorStack.pop());
                    }
                    if (operatorStack.length === 0) {
                        throw new Error('Mismatched parentheses');
                    }
                    operatorStack.pop(); // remove the left parenthesis

                    // if there's a function on top, pop it to output
                    if (operatorStack.length > 0 && 
                        operatorStack[operatorStack.length - 1].type === 'FUNCTION') {
                        outputQueue.push(operatorStack.pop());
                    }
                    break;
            }
        }

        // pop remaining operators
        while (operatorStack.length > 0) {
            const op = operatorStack.pop();
            if (op.type === 'LPAREN') {
                throw new Error('Mismatched parentheses');
            }
            outputQueue.push(op);
        }

        return outputQueue;
    }

    // evaluate postfix expression
    evaluatePostfix(postfixTokens) {
        const stack = [];

        for (const token of postfixTokens) {
            switch (token.type) {
                case 'NUMBER':
                    stack.push(token.value);
                    break;

                case 'CONSTANT':
                    stack.push(this.constants[token.value]);
                    break;

                case 'OPERATOR':
                    if (stack.length < 2) {
                        throw new Error('Invalid expression');
                    }
                    const b = stack.pop();
                    const a = stack.pop();
                    stack.push(this.applyOperator(token.value, a, b));
                    break;

                case 'FUNCTION':
                    if (stack.length < 1) {
                        throw new Error('Invalid expression');
                    }
                    const arg = stack.pop();
                    stack.push(this.applyFunction(token.value, arg));
                    break;
            }
        }

        if (stack.length !== 1) {
            throw new Error('Invalid expression');
        }

        return stack[0];
    }

    applyOperator(op, a, b) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': 
                if (b === 0) throw new Error('Division by zero');
                return a / b;
            case '%': return a % b;
            case '^': return Math.pow(a, b);
            default: throw new Error(`Unknown operator: ${op}`);
        }
    }

    applyFunction(func, arg) {
        switch (func) {
            case 'sin': return Math.sin(arg);
            case 'cos': return Math.cos(arg);
            case 'tan': return Math.tan(arg);
            case 'asin': 
                if (arg < -1 || arg > 1) throw new Error('asin domain error');
                return Math.asin(arg);
            case 'acos': 
                if (arg < -1 || arg > 1) throw new Error('acos domain error');
                return Math.acos(arg);
            case 'atan': return Math.atan(arg);
            case 'log': 
                if (arg <= 0) throw new Error('log domain error');
                return Math.log10(arg);
            case 'ln': 
                if (arg <= 0) throw new Error('ln domain error');
                return Math.log(arg);
            case 'sqrt': 
                if (arg < 0) throw new Error('sqrt domain error');
                return Math.sqrt(arg);
            case 'cbrt': return Math.cbrt(arg);
            case 'abs': return Math.abs(arg);
            case 'exp': return Math.exp(arg);
            default: throw new Error(`Unknown function: ${func}`);
        }
    }

    // main parse and evaluate method
    evaluate(expression) {
        if (!expression || expression.trim() === '') {
            throw new Error('Empty expression');
        }

        const tokens = this.tokenize(expression);
        const postfix = this.toPostfix(tokens);
        const result = this.evaluatePostfix(postfix);

        // round to avoid floating point errors
        return Math.round(result * 1e12) / 1e12;
    }
}

// export for use in other modules
const parser = new ExpressionParser();