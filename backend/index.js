import * as fs from 'fs';
import * as cp from 'child_process';

import Compiler from './compiler';
import Scope from './scope';

export const llvm = {
  compile: (ast) => {
    const c = new Compiler();
    const scope = new Scope();
  },
  build: (buildDir, program) => {
    const prog = 'prog';

    fs.writeFileSync(`${buildDir}/${prog}.ll`, program);
    cp.execSync(`llc -o ${buildDir}/${prog}.s ${buildDir}/${prog}.ll`);
    cp.execSync(`gcc -o ${buildDir}/${prog} ${buildDir}/${prog}.s`);
  },
};

export default {};
