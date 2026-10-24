import { existsSync, readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const runtimeRoot = path.join(root, '.local-tools/java/runtime');
const runtime = existsSync(runtimeRoot) ? readdirSync(runtimeRoot).map(name => path.join(runtimeRoot, name)).find(candidate => existsSync(path.join(candidate, 'bin/java.exe'))) : undefined;
const firebaseCli = process.platform === 'win32' && process.env.APPDATA
  ? path.join(process.env.APPDATA, 'npm/node_modules/firebase-tools/lib/bin/firebase.js')
  : null;
if (!firebaseCli || !existsSync(firebaseCli)) throw new Error('Firebase CLI was not found. Install firebase-tools or run firebase emulators:start --only auth,database --project demo-roktokorobi-rules.');
const env = { ...process.env };
if (runtime) {
  env.JAVA_HOME = runtime;
  const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
  env[pathKey] = `${path.join(runtime, 'bin')}${path.delimiter}${env[pathKey] || ''}`;
}
const exportPath = path.join(root, '.local-tools/country-emulator-data');
const args = [firebaseCli, 'emulators:start', '--only', 'auth,database', '--project', 'demo-roktokorobi-rules', '--export-on-exit', exportPath];
if (existsSync(path.join(exportPath, 'firebase-export-metadata.json'))) args.push('--import', exportPath);
const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit', env });
child.on('exit', code => { process.exitCode = code ?? 1; });
