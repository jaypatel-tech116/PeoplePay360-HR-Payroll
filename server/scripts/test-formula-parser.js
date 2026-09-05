const { validateFormulaExpression, evaluateFormula } = require("../src/services/formula-parser.service");

console.log("Test 1 Standard math:", validateFormulaExpression("BASIC * 0.40", 50000));
console.log("Test 2 Odoo python syntax:", validateFormulaExpression("result = categories['BASIC'] * 0.40", 50000));
console.log("Test 3 Days formula:", validateFormulaExpression("(WAGE / 30) * PAID_DAYS", 60000));
console.log("Test 4 Math functions:", validateFormulaExpression("min(BASIC * 0.12, 1800)", 50000));
console.log("Test 5 Syntax error:", validateFormulaExpression("BASIC + * 5", 50000));
