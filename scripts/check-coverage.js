#!/usr/bin/env node
/**
 * Custom Coverage Threshold Checker
 * 
 * Enforces per-directory coverage thresholds that Vitest doesn't support natively.
 * Run after `vitest run --coverage` generates coverage-summary.json.
 * 
 * Usage: node scripts/check-coverage.js
 * Exit 0 = Pass, Exit 1 = Fail
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION: Per-Path Thresholds
// ============================================
const CRITICAL_PATHS = {
    // Path segment to match : { metric: threshold }
    'governance': { lines: 90, functions: 90 },
    'memory': { lines: 90, functions: 90 },
};

// ============================================
// MAIN
// ============================================
const coveragePath = path.join(__dirname, '../packages/core/coverage/coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage summary not found. Run `pnpm test:coverage` first.');
    process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

let failed = false;
const results = [];

for (const [pathKey, thresholds] of Object.entries(CRITICAL_PATHS)) {
    // Find matching entries in coverage summary
    // Paths can be Windows (E:\\git\\...) or Unix (/home/...)
    // Normalize by checking if path contains the segment
    const matchingFiles = Object.keys(summary).filter(k => {
        if (k === 'total') return false;
        // Normalize path separators and check for segment
        const normalized = k.replace(/\\\\/g, '/').replace(/\\/g, '/');
        return normalized.includes(`/${pathKey}/`) || normalized.includes(`\\${pathKey}\\`);
    });

    if (matchingFiles.length === 0) {
        console.warn(`⚠️  No coverage data found for path: ${pathKey}`);
        continue;
    }

    // Aggregate coverage for this path
    let totalLines = 0, coveredLines = 0;
    let totalFunctions = 0, coveredFunctions = 0;

    for (const file of matchingFiles) {
        const data = summary[file];
        if (data.lines) {
            totalLines += data.lines.total;
            coveredLines += data.lines.covered;
        }
        if (data.functions) {
            totalFunctions += data.functions.total;
            coveredFunctions += data.functions.covered;
        }
    }

    const linesPct = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
    const funcsPct = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;

    const linePass = linesPct >= thresholds.lines;
    const funcPass = funcsPct >= thresholds.functions;

    results.push({
        path: pathKey,
        lines: { pct: linesPct.toFixed(2), threshold: thresholds.lines, pass: linePass },
        functions: { pct: funcsPct.toFixed(2), threshold: thresholds.functions, pass: funcPass },
    });

    if (!linePass || !funcPass) {
        failed = true;
    }
}

// ============================================
// OUTPUT
// ============================================
console.log('\n📊 Per-Path Coverage Check\n');
console.log('Path'.padEnd(15) + 'Lines'.padEnd(25) + 'Functions');
console.log('-'.repeat(60));

for (const r of results) {
    const lineStatus = r.lines.pass ? '✅' : '❌';
    const funcStatus = r.functions.pass ? '✅' : '❌';

    console.log(
        r.path.padEnd(15) +
        `${lineStatus} ${r.lines.pct}% (≥${r.lines.threshold}%)`.padEnd(25) +
        `${funcStatus} ${r.functions.pct}% (≥${r.functions.threshold}%)`
    );
}

console.log('-'.repeat(60));

if (failed) {
    console.log('\n❌ Coverage thresholds not met. See above for details.\n');
    process.exit(1);
} else {
    console.log('\n✅ All critical path coverage thresholds met.\n');
    process.exit(0);
}
