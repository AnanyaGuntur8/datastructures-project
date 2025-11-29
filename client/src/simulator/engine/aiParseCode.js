// src/simulator/engine/aiParseCode.js
import antlr4 from "antlr4";
import JavaLexer from "../../parser/grammar/JavaLexer.js";
import JavaParser from "../../parser/grammar/JavaParser.js";

export function parseJava(code) {
  const chars = new antlr4.InputStream(code);
  const lexer = new JavaLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new JavaParser(tokens);

  parser.removeErrorListeners(); // disable default error printing
  const tree = parser.compilationUnit(); // start rule

  return tree.toStringTree(parser.ruleNames); // or process the tree how you want
}
