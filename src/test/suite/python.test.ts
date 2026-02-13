import * as assert from 'assert';
import {
  setupTest,
  teardownTest,
  openTestFile,
  callTool,
  TestContext,
} from '../helpers/testHelpers';

suite('Python Symbol Tests', () => {
  let context: TestContext;

  suiteSetup(async () => {
    context = await setupTest();
  });

  suiteTeardown(async () => {
    await teardownTest(context);
  });

  // ========== Definition Tests ==========

  test('should find Python class definition', async () => {
    await openTestFile('calculator.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'BasicCalculator',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find at least one definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('calculator.py'), 'Should point to calculator.py');
    assert.strictEqual(def.symbol.kind, 'Class', 'Should identify as class');
  });

  test('should find Python method definition', async () => {
    await openTestFile('calculator.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'BasicCalculator.sum',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('calculator.py'), 'Should point to calculator.py');
    assert.strictEqual(def.symbol.kind, 'Method', 'Should identify as method');
    assert.strictEqual(def.symbol.container, 'BasicCalculator', 'Should have correct container');
  });

  test('should find Python function definition', async () => {
    await openTestFile('calculator.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'calculate_average',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('calculator.py'), 'Should point to calculator.py');
    assert.strictEqual(def.symbol.kind, 'Function', 'Should identify as function');
  });

  test('should find inherited class method', async () => {
    await openTestFile('calculator.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'ScientificCalculator.power',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('calculator.py'), 'Should point to calculator.py');
    assert.strictEqual(def.symbol.kind, 'Method', 'Should identify as method');
    assert.strictEqual(def.symbol.container, 'ScientificCalculator', 'Should have correct container');
  });

  // ========== DataProcessor Tests ==========

  test('should find DataProcessor class definition', async () => {
    await openTestFile('data_processor.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'DataProcessor',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('data_processor.py'), 'Should point to data_processor.py');
    assert.strictEqual(def.symbol.kind, 'Class', 'Should identify as class');
  });

  test('should find module-level function in data_processor', async () => {
    await openTestFile('data_processor.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'process_data',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('data_processor.py'), 'Should point to data_processor.py');
    assert.strictEqual(def.symbol.kind, 'Function', 'Should identify as function');
  });

  test('should find DataProcessor method', async () => {
    await openTestFile('data_processor.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'DataProcessor.process_batch',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('data_processor.py'), 'Should point to data_processor.py');
    assert.strictEqual(def.symbol.kind, 'Method', 'Should identify as method');
    assert.strictEqual(def.symbol.container, 'DataProcessor', 'Should have correct container');
  });

  // ========== Debug Breakpoint Tests ==========

  test('should set breakpoint on Python class method', async () => {
    await openTestFile('calculator.py');

    const result = await callTool('debug_setBreakpoint', {
      symbol: 'BasicCalculator.sum',
      format: 'detailed',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.breakpoint, 'Should return breakpoint info');
    assert.strictEqual(result.breakpoint.symbol, 'BasicCalculator.sum', 'Should have symbol name');
    assert.ok(result.breakpoint.file.endsWith('calculator.py'), 'Should be in calculator.py');
  });

  test('should set breakpoint on Python function', async () => {
    await openTestFile('data_processor.py');

    const result = await callTool('debug_setBreakpoint', {
      symbol: 'validate_item',
      format: 'detailed',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.breakpoint, 'Should return breakpoint info');
    assert.ok(result.breakpoint.file.endsWith('data_processor.py'), 'Should be in data_processor.py');
  });

  test('should handle Python symbol not found', async () => {
    await openTestFile('calculator.py');

    const result = await callTool('debug_setBreakpoint', {
      symbol: 'nonExistentMethod',
      format: 'detailed',
    });

    assert.ok(result.error, 'Should have error');
    assert.ok(result.error.includes('not found'), 'Should mention symbol not found');
  });

  // ========== main.py (FastAPI) Tests ==========

  test('should find FastAPI app instance', async () => {
    await openTestFile('main.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'app',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('main.py'), 'Should point to main.py');
    // app is a variable/constant at module level
    assert.ok(
      def.symbol.kind === 'Variable' ||
      def.symbol.kind === 'Constant' ||
      def.symbol.kind === 'Class',
      'Should identify as variable, constant, or class'
    );
  });

  test('should find FastAPI endpoint function root', async () => {
    await openTestFile('main.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'root',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('main.py'), 'Should point to main.py');
    assert.strictEqual(def.symbol.kind, 'Function', 'Should identify as function');
  });

  test('should find FastAPI endpoint function health', async () => {
    await openTestFile('main.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'health',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('main.py'), 'Should point to main.py');
    assert.strictEqual(def.symbol.kind, 'Function', 'Should identify as function');
  });

  test('should find FastAPI endpoint function check_env', async () => {
    await openTestFile('main.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'check_env',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('main.py'), 'Should point to main.py');
    assert.strictEqual(def.symbol.kind, 'Function', 'Should identify as function');
  });

  test('should set breakpoint on FastAPI endpoint', async () => {
    await openTestFile('main.py');

    const result = await callTool('debug_setBreakpoint', {
      symbol: 'root',
      format: 'detailed',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.breakpoint, 'Should return breakpoint info');
    assert.ok(result.breakpoint.file.endsWith('main.py'), 'Should be in main.py');
  });

  // ========== script.py Tests ==========

  test('should find script main function', async () => {
    await openTestFile('script.py');

    const result = await callTool('definition', {
      format: 'detailed',
      symbol: 'main',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.definitions, 'Should return definitions');
    assert.ok(result.definitions.length > 0, 'Should find definition');

    const def = result.definitions[0];
    assert.ok(def.uri.endsWith('script.py'), 'Should point to script.py');
    assert.strictEqual(def.symbol.kind, 'Function', 'Should identify as function');
  });

  test('should set breakpoint on script main function', async () => {
    await openTestFile('script.py');

    const result = await callTool('debug_setBreakpoint', {
      symbol: 'main',
      format: 'detailed',
    });

    assert.ok(!result.error, `Should not have error: ${result.error}`);
    assert.ok(result.breakpoint, 'Should return breakpoint info');
    assert.ok(result.breakpoint.file.endsWith('script.py'), 'Should be in script.py');
    assert.ok(typeof result.breakpoint.line === 'number', 'Should have line number');
  });

  test('should set breakpoint by file and line in script.py', async () => {
    await openTestFile('script.py');

    const result = await callTool('debug_setBreakpoint', {
      file: 'script.py',
      line: 7,  // def main():
      format: 'detailed',
    });

    assert.ok(!result.error, 'Should not have error');
    assert.ok(result.breakpoint, 'Should return breakpoint info');
    assert.ok(result.breakpoint.file.endsWith('script.py'), 'Should be in script.py');
    assert.strictEqual(result.breakpoint.line, 7, 'Should have correct line');
  });
});
