import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/**/index.ts'],

            // Global thresholds
            thresholds: {
                lines: 70,
                branches: 60,
                functions: 75,
                statements: 70,
            },
        },
    },
});
