import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'happy-dom',
    
    // Global test APIs
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/setup.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'scripts/**'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    
    // Test file patterns
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Exclude patterns
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // Reporter configuration
    reporters: process.env.CI ? ['json', 'junit', 'verbose'] : ['verbose'],
    outputFile: {
      json: './test-results/results.json',
      junit: './test-results/junit.xml'
    },
    
    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'three': resolve(__dirname, './node_modules/three/build/three.module.js')
    }
  },
  
  // Define global constants
  define: {
    'import.meta.env.TEST': 'true'
  }
});