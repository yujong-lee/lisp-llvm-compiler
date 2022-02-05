import * as fs from 'fs';

import { sExpression as parse } from './frontend/parserGenerator';
import { llvm } from './backend';

function main(args) {
  const input = fs.readFileSync(args[2]).toString();

  const [ast] = parse(input);
  const program = llvm.compile(ast);

  fs.mkdirSync('build');

  llvm.build('build', program);
}

main(process.argv);
