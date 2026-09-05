/**
 * Safe Mathematical Expression Parser and Formula Evaluator
 * 
 * CRITICAL SECURITY ASSURANCE:
 * Completely avoids eval(), Function(), or any dynamic code execution.
 * Uses strict tokenization and Shunting-Yard / AST evaluation for payroll formulas.
 */

// Supported binary operators with precedence and associativity
const OPERATORS = {
  "+": { prec: 1, assoc: "L", fn: (a, b) => a + b },
  "-": { prec: 1, assoc: "L", fn: (a, b) => a - b },
  "*": { prec: 2, assoc: "L", fn: (a, b) => a * b },
  "/": { prec: 2, assoc: "L", fn: (a, b) => (b === 0 ? 0 : a / b) },
  "%": { prec: 2, assoc: "L", fn: (a, b) => (b === 0 ? 0 : a % b) },
};

// Supported mathematical functions
const FUNCTIONS = {
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  round: (val, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  },
  floor: (val) => Math.floor(val),
  ceil: (val) => Math.ceil(val),
  abs: (val) => Math.abs(val),
};

/**
 * Tokenize a formula string
 * @param {string} expr
 * @returns {Array<{type: string, value: any}>}
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  const str = String(expr || "").trim();

  while (i < str.length) {
    const ch = str[i];

    // Skip whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number literal
    if (/\d/.test(ch) || (ch === "." && /\d/.test(str[i + 1] || ""))) {
      let numStr = "";
      while (i < str.length && (/[\d.]/.test(str[i]))) {
        numStr += str[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: parseFloat(numStr) });
      continue;
    }

    // Identifiers (Variables or Functions)
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (i < str.length && /[a-zA-Z0-9_]/.test(str[i])) {
        idStr += str[i];
        i++;
      }
      const upper = idStr.toUpperCase();
      const lower = idStr.toLowerCase();

      if (FUNCTIONS[lower]) {
        tokens.push({ type: "FUNCTION", value: lower });
      } else {
        tokens.push({ type: "VARIABLE", value: upper });
      }
      continue;
    }

    // Operators
    if (OPERATORS[ch]) {
      // Check for unary minus: preceded by another operator, open paren, or at start
      const prev = tokens[tokens.length - 1];
      if (ch === "-" && (!prev || prev.type === "OPERATOR" || prev.type === "LPAREN" || prev.type === "COMMA")) {
        // Handle unary minus by pushing a 0 before subtraction: (0 - x)
        tokens.push({ type: "NUMBER", value: 0 });
      }
      tokens.push({ type: "OPERATOR", value: ch });
      i++;
      continue;
    }

    // Parentheses
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    // Comma (argument separator)
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }

    // If unrecognized character, throw controlled parsing error
    throw new Error(`Invalid character in salary formula: '${ch}' at position ${i}`);
  }

  return tokens;
}

/**
 * Evaluates mathematical tokens using Shunting-Yard RPN stack
 * @param {Array} tokens
 * @param {Object} context - Key-value pair of context variables (e.g. { BASIC: 50000, HRA: 20000 })
 * @returns {number}
 */
function evaluateTokens(tokens, context = {}) {
  const outputQueue = [];
  const operatorStack = [];

  // Standardize context keys to uppercase
  const normalizedContext = {};
  for (const [k, v] of Object.entries(context || {})) {
    normalizedContext[String(k).toUpperCase()] = parseFloat(v) || 0;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "NUMBER") {
      outputQueue.push(token.value);
    } else if (token.type === "VARIABLE") {
      const val = normalizedContext[token.value] !== undefined ? normalizedContext[token.value] : 0;
      outputQueue.push(val);
    } else if (token.type === "FUNCTION") {
      operatorStack.push(token);
    } else if (token.type === "COMMA") {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== "LPAREN") {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length === 0) {
        throw new Error("Misplaced comma or mismatched parentheses in formula.");
      }
    } else if (token.type === "OPERATOR") {
      const o1 = token.value;
      const op1 = OPERATORS[o1];

      while (operatorStack.length > 0) {
        const top = operatorStack[operatorStack.length - 1];
        if (top.type === "OPERATOR") {
          const o2 = top.value;
          const op2 = OPERATORS[o2];
          if ((op1.assoc === "L" && op1.prec <= op2.prec) || (op1.assoc === "R" && op1.prec < op2.prec)) {
            outputQueue.push(operatorStack.pop());
            continue;
          }
        } else if (top.type === "FUNCTION") {
          outputQueue.push(operatorStack.pop());
          continue;
        }
        break;
      }
      operatorStack.push(token);
    } else if (token.type === "LPAREN") {
      operatorStack.push(token);
    } else if (token.type === "RPAREN") {
      let foundLparen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.type === "LPAREN") {
          foundLparen = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundLparen) {
        throw new Error("Mismatched parentheses in formula.");
      }
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type === "FUNCTION") {
        outputQueue.push(operatorStack.pop());
      }
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op.type === "LPAREN" || op.type === "RPAREN") {
      throw new Error("Mismatched parentheses in formula.");
    }
    outputQueue.push(op);
  }

  // Evaluate RPN queue
  const evaluationStack = [];

  for (const item of outputQueue) {
    if (typeof item === "number") {
      evaluationStack.push(item);
    } else if (item.type === "OPERATOR") {
      const b = evaluationStack.pop();
      const a = evaluationStack.pop();
      if (a === undefined || b === undefined) {
        throw new Error(`Insufficient operands for operator '${item.value}'`);
      }
      const res = OPERATORS[item.value].fn(a, b);
      evaluationStack.push(res);
    } else if (item.type === "FUNCTION") {
      const fn = FUNCTIONS[item.value];
      if (!fn) throw new Error(`Unknown function: ${item.value}`);
      // Unary/binary function handling
      if (item.value === "round" || item.value === "min" || item.value === "max") {
        const b = evaluationStack.pop();
        const a = evaluationStack.pop();
        if (a !== undefined && b !== undefined) {
          evaluationStack.push(fn(a, b));
        } else if (b !== undefined) {
          evaluationStack.push(fn(b));
        } else {
          evaluationStack.push(0);
        }
      } else {
        const arg = evaluationStack.pop();
        evaluationStack.push(fn(arg !== undefined ? arg : 0));
      }
    }
  }

  if (evaluationStack.length !== 1) {
    throw new Error("Invalid formula expression: could not resolve to a single scalar value.");
  }

  const finalValue = evaluationStack[0];
  if (isNaN(finalValue) || !isFinite(finalValue)) {
    return 0;
  }

  return parseFloat(finalValue.toFixed(2));
}

/**
 * Safely parse and calculate a formula rule against context
 * @param {string} formula
 * @param {Object} context
 * @returns {number}
 */
const evaluateFormula = (formula, context = {}) => {
  if (!formula || typeof formula !== "string" || !formula.trim()) {
    return 0;
  }

  try {
    const tokens = tokenize(formula);
    return evaluateTokens(tokens, context);
  } catch (err) {
    console.error(`❌ Formula Evaluation Error [${formula}]:`, err.message);
    throw new Error(`Salary formula error: ${err.message}`);
  }
};

module.exports = {
  evaluateFormula,
  tokenize,
};
