import { spawn } from 'node:child_process';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '--webpack', '-p', '3101', '--hostname', '127.0.0.1'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'true' },
});
child.on('exit', code => { process.exitCode = code ?? 1; });
