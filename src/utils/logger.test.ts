import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

// Create Logger class from the exported logger's constructor
const Logger = logger.constructor as new (serviceName?: string) => typeof logger;

describe('Logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    log: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create logger with component name', () => {
      const logger = new Logger('TestComponent');
      logger.info('test message');

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[TestComponent]')
      );
    });

    it('should create logger with default name', () => {
      const logger = new Logger();
      logger.info('test message');

      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('[HUMMBL]')
      );
    });
  });

  describe('logging methods', () => {
    it('should log debug messages in development', () => {
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = true;

      const logger = new Logger('Test');
      logger.debug('debug message');

      expect(consoleSpy.debug).toHaveBeenCalled();
      expect(consoleSpy.debug.mock.calls[0][0]).toContain('[Test]');
      expect(consoleSpy.debug.mock.calls[0][0]).toContain('debug message');

      import.meta.env.DEV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = false;

      const logger = new Logger('Test');
      logger.debug('debug message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();

      import.meta.env.DEV = originalEnv;
    });

    it('should log info messages', () => {
      const logger = new Logger('Test');
      logger.info('info message', { key: 'value' });

      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.info.mock.calls[0][0]).toContain('[Test]');
      expect(consoleSpy.info.mock.calls[0][0]).toContain('info message');
    });

    it('should log warn messages', () => {
      const logger = new Logger('Test');
      logger.warn('warning message', { code: 123 });

      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('[Test]');
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('warning message');
    });

    it('should log error messages', () => {
      const logger = new Logger('Test');
      const error = new Error('Test error');
      logger.error('error message', error);

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.error.mock.calls[0][0]).toContain('[Test]');
      expect(consoleSpy.error.mock.calls[0][0]).toContain('error message');
    });
  });

  describe('child logger', () => {
    it('should create child logger with nested component name', () => {
      const parentLogger = new Logger('Parent');
      const childLogger = parentLogger.child('Child');

      childLogger.info('test message');

      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.info.mock.calls[0][0]).toContain('[Parent:Child]');
    });

    it('should create child logger from default parent', () => {
      const parentLogger = new Logger();
      const childLogger = parentLogger.child('Child');

      childLogger.info('test message');

      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.info.mock.calls[0][0]).toContain('[HUMMBL:Child]');
    });
  });

  describe('formatMessage', () => {
    it('should include timestamp', () => {
      const logger = new Logger('Test');
      logger.info('message');

      expect(consoleSpy.info).toHaveBeenCalled();
      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle context object', () => {
      const logger = new Logger('Test');
      const context = { userId: '123', action: 'login' };

      logger.info('User logged in', context);

      expect(consoleSpy.info).toHaveBeenCalled();
      const logOutput = consoleSpy.info.mock.calls[0][0];
      expect(logOutput).toContain('[Test]');
      expect(logOutput).toContain('User logged in');
      expect(logOutput).toContain('"userId":"123"');
    });
  });
});
