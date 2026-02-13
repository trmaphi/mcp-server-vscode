import * as path from 'path';
import { runTests, runVSCodeCommand } from '@vscode/test-electron';
import { execSync } from 'child_process';
import * as fs from 'fs';

/**
 * Setup Python dependencies in the test workspace using uv
 */
function setupPythonDependencies(testWorkspace: string): void {
  const venvPath = path.join(testWorkspace, '.venv');
  const requirementsMet = fs.existsSync(path.join(venvPath, 'lib'));

  if (!requirementsMet) {
    console.log('Setting up Python dependencies for test workspace...');
    try {
      // Create venv
      execSync('uv venv', { cwd: testWorkspace, stdio: 'inherit' });
      // Install fastapi and uvicorn
      execSync('uv pip install fastapi uvicorn', { cwd: testWorkspace, stdio: 'inherit' });
      console.log('Python dependencies installed successfully');
    } catch (error) {
      console.warn('Failed to setup Python dependencies:', error);
      // Don't fail the tests, just warn
    }
  } else {
    console.log('Python dependencies already installed');
  }
}

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // The path to the test workspace
    const testWorkspace = path.resolve(__dirname, '../../test-workspace');

    // Setup Python dependencies for test workspace
    setupPythonDependencies(testWorkspace);

    // Parse command line arguments for mocha options
    const args = process.argv.slice(2);
    const grepIndex = args.indexOf('--grep');
    if (grepIndex !== -1 && args[grepIndex + 1]) {
      process.env.MOCHA_GREP = args[grepIndex + 1];
    }

    // Install Python extension to the test profile
    const userDataDir = '/tmp/vscode-test-profile';
    await runVSCodeCommand(
      ['--install-extension', 'ms-python.python', '--user-data-dir', userDataDir],
      { extensionDevelopmentPath }
    );

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        testWorkspace,
        // Note: Not using --disable-extensions to allow Python extension (language server) to work
        '--disable-gpu',
        '--no-sandbox',
        '--disable-updates',
        '--skip-welcome',
        '--skip-release-notes',
        '--disable-workspace-trust',
        '--disable-telemetry',
        '--disable-crash-reporter',
        '--user-data-dir=/tmp/vscode-test-profile',
      ],
      extensionTestsEnv: {
        ...process.env,
        MOCHA_GREP: process.env.MOCHA_GREP,
        // Disable telemetry and other features that might slow down tests
        VSCODE_SKIP_PRELAUNCH: '1',
        ELECTRON_NO_ATTACH_CONSOLE: '1',
      },
    });
  } catch {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
