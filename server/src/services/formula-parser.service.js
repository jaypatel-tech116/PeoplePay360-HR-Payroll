/**
 * Safe Mathematical Expression Parser and Formula Evaluator
 * 
 * CRITICAL SECURITY ASSURANCE:
 * Completely avoids eval(), Function(), or any dynamic code execution.
 * Uses strict tokenization and Shunting-Yard / AST evaluation for payroll formulas.
 */

// Supported binary operators with precedence and associativity
const OPERATORS = {
  "+": { prec: 2, assoc: "L", fn: (a, b) => a + b },
  "-": { prec: 2, assoc: "L", fn: (a, b) => a - b },
  "*": { prec: 3, assoc: "L", fn: (a, b) => a * b },
  "/": { prec: 3, assoc: "L", fn: (a, b) => (b === 0 ? 0 : a / b) },
  "%": { prec: 3, assoc: "L", fn: (a, b) => (b === 0 ? 0 : a % b) },
  ">=": { prec: 1, assoc: "L", fn: (a, b) => (a >= b ? 1 : 0) },
  "<=": { prec: 1, assoc: "L", fn: (a, b) => (a <= b ? 1 : 0) },
  "==": { prec: 1, assoc: "L", fn: (a, b) => (a === b ? 1 : 0) },
  "!=": { prec: 1, assoc: "L", fn: (a, b) => (a !== b ? 1 : 0) },
  ">": { prec: 1, assoc: "L", fn: (a, b) => (a > b ? 1 : 0) },
  "<": { prec: 1, assoc: "L", fn: (a, b) => (a < b ? 1 : 0) },
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
  if: (cond, thenVal, elseVal = 0) => (cond ? thenVal : elseVal),
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

    // Two-character operators (>=, <=, ==, !=)
    const twoChar = str.slice(i, i + 2);
    if (OPERATORS[twoChar]) {
      tokens.push({ type: "OPERATOR", value: twoChar });
      i += 2;
      continue;
    }

    // Single-character operators (+, -, *, /, %, >, <)
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
      // Function handling (unary, binary, or ternary if)
      if (item.value === "if") {
        const c = evaluationStack.pop(); // elseVal
        const b = evaluationStack.pop(); // thenVal
        const a = evaluationStack.pop(); // cond
        evaluationStack.push(fn(a !== undefined ? a : 0, b !== undefined ? b : 0, c !== undefined ? c : 0));
      } else if (item.value === "round" || item.value === "min" || item.value === "max") {
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
 * Normalizes Odoo Python-style formulas to clean mathematical expressions
 * Supports:
 * - result = ...
 * - categories['BASIC'] / categories["BASIC"] / categories.BASIC -> BASIC
 * - rules['BASIC'] / rules["BASIC"] / rules.BASIC -> BASIC
 * - contract.wage / contract['wage'] -> WAGE
 * - payslip.paid_days -> PAID_DAYS
 */
function normalizeFormula(expr) {
  if (!expr || typeof expr !== "string") return "";
  let s = expr.trim();

  // Strip leading 'result =' or 'result='
  s = s.replace(/^result\s*=\s*/i, "");

  // Replace categories['CODE'] or categories["CODE"] with CODE
  s = s.replace(/categories\s*\[\s*['"]([a-zA-Z0-9_]+)['"]\s*\]/gi, "$1");
  s = s.replace(/categories\.([a-zA-Z0-9_]+)/gi, "$1");

  // Replace rules['CODE'] or rules["CODE"] with CODE
  s = s.replace(/rules\s*\[\s*['"]([a-zA-Z0-9_]+)['"]\s*\]/gi, "$1");
  s = s.replace(/rules\.([a-zA-Z0-9_]+)/gi, "$1");

  // Replace contract.wage or contract['wage'] with WAGE
  s = s.replace(/contract\s*\[\s*['"]wage['"]\s*\]/gi, "WAGE");
  s = s.replace(/contract\.wage/gi, "WAGE");

  // Replace payslip metrics with uppercase equivalents
  s = s.replace(/payslip\.paid_days/gi, "PAID_DAYS");
  s = s.replace(/payslip\.worked_days/gi, "WORKED_DAYS");
  s = s.replace(/payslip\.scheduled_days/gi, "SCHEDULED_DAYS");
  s = s.replace(/payslip\.total_days/gi, "TOTAL_DAYS");

  return s.trim();
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

  const normalized = normalizeFormula(formula);
  if (!normalized) return 0;

  try {
    const tokens = tokenize(normalized);
    return evaluateTokens(tokens, context);
  } catch (err) {
    console.error(`❌ Formula Evaluation Error [${formula}]:`, err.message);
    throw new Error(`Salary formula error: ${err.message}`);
  }
};

/**
 * Dry-run validates a formula against a standard sample context without modifying database
 * @param {string} formula
 * @param {number|Object} sampleWageOrContext
 * @returns {{ isValid: boolean, normalizedFormula?: string, sampleResult?: number, variablesUsed?: string[], error?: string }}
 */
const validateFormulaExpression = (formula, sampleWageOrContext = 50000) => {
  if (!formula || typeof formula !== "string" || !formula.trim()) {
    return { isValid: false, error: "Formula cannot be empty." };
  }

  const normalized = normalizeFormula(formula);
  if (!normalized) {
    return { isValid: false, error: "Formula expression is empty after normalization." };
  }

  const sampleWage = typeof sampleWageOrContext === "number" 
    ? sampleWageOrContext 
    : (parseFloat(sampleWageOrContext?.WAGE) || 50000);

  const sampleContext = typeof sampleWageOrContext === "object" && sampleWageOrContext !== null && !Array.isArray(sampleWageOrContext)
    ? {
        WAGE: sampleWage,
        CONTRACT_WAGE: sampleWage,
        BASIC: sampleWage * 0.5,
        HRA: sampleWage * 0.2,
        GROSS: sampleWage,
        DEDUCTIONS: sampleWage * 0.12,
        NET: sampleWage * 0.88,
        SCHEDULED_DAYS: 30,
        WORKED_DAYS: 28,
        PRESENT_DAYS: 28,
        PAID_DAYS: 30,
        LOP_DAYS: 0,
        UNPAID_DAYS: 0,
        OVERTIME_HOURS: 0,
        TOTAL_DAYS: 30,
        PF: sampleWage * 0.5 * 0.12,
        PT: 200,
        TDS: 1500,
        ...sampleWageOrContext,
      }
    : {
        WAGE: sampleWage,
        CONTRACT_WAGE: sampleWage,
        BASIC: sampleWage * 0.5,
        HRA: sampleWage * 0.2,
        GROSS: sampleWage,
        DEDUCTIONS: sampleWage * 0.12,
        NET: sampleWage * 0.88,
        SCHEDULED_DAYS: 30,
        WORKED_DAYS: 28,
        PRESENT_DAYS: 28,
        PAID_DAYS: 30,
        LOP_DAYS: 0,
        UNPAID_DAYS: 0,
        OVERTIME_HOURS: 0,
        TOTAL_DAYS: 30,
        PF: sampleWage * 0.5 * 0.12,
        PT: 200,
        TDS: 1500,
      };

  try {
    const tokens = tokenize(normalized);
    const variablesUsed = [...new Set(tokens.filter((t) => t.type === "VARIABLE").map((t) => t.value))];
    const sampleResult = evaluateTokens(tokens, sampleContext);

    return {
      isValid: true,
      normalizedFormula: normalized,
      sampleResult,
      variablesUsed,
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message,
    };
  }
};

module.exports = {
  evaluateFormula,
  normalizeFormula,
  validateFormulaExpression,
  tokenize,
};

