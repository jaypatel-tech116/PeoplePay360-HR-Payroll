const { validateFormulaExpression, evaluateFormula } = require("../src/services/formula-parser.service");

console.log("Testing TDS rule formula:", validateFormulaExpression("if(GROSS > 50000, round(GROSS * 0.05, 2), 0)", { GROSS: 60000 }));
