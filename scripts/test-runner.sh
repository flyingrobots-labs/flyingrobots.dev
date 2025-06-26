#!/bin/bash
# Unified test runner script for local, Docker, and CI environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Check if we're in CI environment
if [ "$CI" = "true" ]; then
    print_status "Running in CI environment" "$GREEN"
    VITEST_FLAGS="--run --reporter=json --reporter=junit --outputFile.json=test-results/results.json --outputFile.junit=test-results/junit.xml"
else
    print_status "Running in local environment" "$GREEN"
    VITEST_FLAGS="--watch=false --reporter=verbose"
fi

# Check if we should run in Docker
if [ "$1" = "--docker" ] || [ "$USE_DOCKER" = "true" ]; then
    print_status "Running tests in Docker..." "$YELLOW"
    docker-compose -f docker-compose.test.yml build
    docker-compose -f docker-compose.test.yml run --rm test
    docker-compose -f docker-compose.test.yml down
else
    print_status "Running tests locally..." "$YELLOW"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..." "$YELLOW"
        npm ci
    fi
    
    # Run tests with coverage
    npx vitest $VITEST_FLAGS --coverage
fi

# Check test results
if [ $? -eq 0 ]; then
    print_status "✅ All tests passed!" "$GREEN"
    
    # Show coverage summary if available
    if [ -f "coverage/coverage-summary.json" ]; then
        print_status "\nCoverage Summary:" "$YELLOW"
        node -e "
            const coverage = require('./coverage/coverage-summary.json');
            const total = coverage.total;
            console.log('Lines:', total.lines.pct + '%');
            console.log('Statements:', total.statements.pct + '%');
            console.log('Functions:', total.functions.pct + '%');
            console.log('Branches:', total.branches.pct + '%');
        "
    fi
else
    print_status "❌ Tests failed!" "$RED"
    exit 1
fi