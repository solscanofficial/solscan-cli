#!/usr/bin/env node

import { createProgram } from '../src/cli.js';

const program = createProgram();
program.parse(process.argv);
