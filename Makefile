# Makefile for FlyingRobots.dev
# Ensures consistent test execution across all environments

.PHONY: help test test-local test-docker test-watch test-coverage clean install setup-hooks

# Default target
help:
	@echo "Available commands:"
	@echo "  make test          - Run tests in Docker (default)"
	@echo "  make test-local    - Run tests locally"
	@echo "  make test-docker   - Run tests in Docker"
	@echo "  make test-watch    - Run tests in watch mode (local only)"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make clean         - Clean test artifacts"
	@echo "  make install       - Install dependencies and setup hooks"
	@echo "  make setup-hooks   - Setup git hooks"

# Main test command - always uses Docker for consistency
test:
	@./scripts/test-runner.sh --docker

# Run tests locally (for development)
test-local:
	@./scripts/test-runner.sh

# Explicit Docker test command
test-docker:
	@./scripts/test-runner.sh --docker

# Watch mode for development
test-watch:
	@echo "Starting tests in watch mode..."
	@npx vitest --watch

# Run with coverage report
test-coverage:
	@USE_DOCKER=true ./scripts/test-runner.sh --docker
	@echo "Opening coverage report..."
	@open coverage/index.html 2>/dev/null || xdg-open coverage/index.html 2>/dev/null || echo "Coverage report generated at coverage/index.html"

# Clean test artifacts
clean:
	@echo "Cleaning test artifacts..."
	@rm -rf coverage test-results .nyc_output
	@docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
	@echo "✅ Clean complete"

# Install dependencies and setup
install:
	@echo "Installing dependencies..."
	@npm ci
	@echo "Setting up git hooks..."
	@make setup-hooks
	@echo "✅ Installation complete"

# Setup git hooks
setup-hooks:
	@echo "Setting up git hooks..."
	@npx husky install
	@npx husky add .husky/pre-push 'make test'
	@echo "✅ Git hooks configured"