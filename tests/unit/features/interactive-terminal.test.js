import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractiveTerminal } from '../../../src/components/interactive/Terminal.js';
import { createContainer, cleanupDOM, createMockSceneManager } from '../../utils/test-helpers.js';

describe('Interactive Terminal', () => {
  let terminal;
  let container;
  let sceneManager;
  
  beforeEach(() => {
    container = createContainer('terminal');
    sceneManager = createMockSceneManager();
    terminal = new InteractiveTerminal('terminal', sceneManager);
  });
  
  afterEach(() => {
    cleanupDOM();
  });
  
  describe('Terminal Initialization', () => {
    it('should create terminal UI elements', () => {
      expect(container.querySelector('.terminal-wrapper')).toBeTruthy();
      expect(container.querySelector('.terminal-header')).toBeTruthy();
      expect(container.querySelector('.terminal-body')).toBeTruthy();
      expect(container.querySelector('.terminal-output')).toBeTruthy();
      expect(container.querySelector('.terminal-input')).toBeTruthy();
    });
    
    it('should display welcome message on init', () => {
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('WELCOME TO THE CYBERSPACE TERMINAL');
      expect(output.textContent).toContain("Type 'help' to see available commands");
    });
    
    it('should initialize with empty command history', () => {
      expect(terminal.history).toEqual([]);
      expect(terminal.historyIndex).toBe(-1);
    });
    
    it('should register all expected commands', () => {
      const expectedCommands = [
        'help', 'clear', 'about', 'skills', 'contact', 'resume',
        'projects', 'matrix', 'glitch', 'shapes', 'spawn', 'aabb',
        'fps', 'visuals', 'physics', 'grid', 'ui'
      ];
      
      expectedCommands.forEach(cmd => {
        expect(terminal.commands[cmd]).toBeDefined();
        expect(terminal.commands[cmd].description).toBeTruthy();
        expect(terminal.commands[cmd].execute).toBeInstanceOf(Function);
      });
    });
  });
  
  describe('Command Execution', () => {
    it('should execute valid commands', () => {
      const input = container.querySelector('.terminal-input');
      const output = container.querySelector('.terminal-output');
      
      // Execute 'help' command
      input.value = 'help';
      terminal.executeCommand('help');
      
      expect(output.textContent).toContain('Available commands:');
      expect(output.textContent).toContain('help - Show available commands');
    });
    
    it('should handle invalid commands', () => {
      const output = container.querySelector('.terminal-output');
      const initialContent = output.innerHTML;
      
      terminal.executeCommand('invalidcommand');
      
      expect(output.textContent).toContain('Command not found: invalidcommand');
      expect(output.textContent).toContain("Type 'help' for available commands");
    });
    
    it('should clear input after command execution', () => {
      const input = container.querySelector('.terminal-input');
      input.value = 'help';
      
      terminal.executeCommand('help');
      
      expect(input.value).toBe('');
    });
    
    it('should add commands to history', () => {
      terminal.executeCommand('help');
      terminal.executeCommand('about');
      terminal.executeCommand('skills');
      
      expect(terminal.history).toEqual(['help', 'about', 'skills']);
    });
    
    it('should handle empty command gracefully', () => {
      const outputBefore = container.querySelector('.terminal-output').innerHTML;
      
      terminal.executeCommand('');
      terminal.executeCommand('   ');
      
      const outputAfter = container.querySelector('.terminal-output').innerHTML;
      expect(outputAfter).toBe(outputBefore);
    });
  });
  
  describe('History Navigation', () => {
    beforeEach(() => {
      terminal.history = ['help', 'about', 'skills'];
      terminal.historyIndex = terminal.history.length;
    });
    
    it('should navigate up through history', () => {
      const input = container.querySelector('.terminal-input');
      
      terminal.navigateHistory(-1);
      expect(input.value).toBe('skills');
      
      terminal.navigateHistory(-1);
      expect(input.value).toBe('about');
      
      terminal.navigateHistory(-1);
      expect(input.value).toBe('help');
    });
    
    it('should navigate down through history', () => {
      const input = container.querySelector('.terminal-input');
      terminal.historyIndex = 0;
      
      terminal.navigateHistory(1);
      expect(input.value).toBe('about');
      
      terminal.navigateHistory(1);
      expect(input.value).toBe('skills');
    });
    
    it('should save current input when starting history navigation', () => {
      const input = container.querySelector('.terminal-input');
      input.value = 'current command';
      terminal.historyIndex = -1;
      
      terminal.navigateHistory(-1);
      
      expect(terminal.currentInput).toBe('current command');
    });
    
    it('should handle empty history', () => {
      terminal.history = [];
      const input = container.querySelector('.terminal-input');
      input.value = 'test';
      
      terminal.navigateHistory(-1);
      expect(input.value).toBe('test');
    });
  });
  
  describe('Autocomplete', () => {
    it('should autocomplete unique command prefix', () => {
      const input = container.querySelector('.terminal-input');
      input.value = 'he';
      
      terminal.autocomplete();
      
      expect(input.value).toBe('help');
    });
    
    it('should show multiple matches for ambiguous prefix', () => {
      const input = container.querySelector('.terminal-input');
      const output = container.querySelector('.terminal-output');
      input.value = 's';
      
      terminal.autocomplete();
      
      expect(output.textContent).toContain('Available commands:');
      expect(output.textContent).toContain('skills');
      expect(output.textContent).toContain('shapes');
      expect(output.textContent).toContain('spawn');
    });
    
    it('should handle no matches', () => {
      const input = container.querySelector('.terminal-input');
      input.value = 'xyz';
      
      terminal.autocomplete();
      
      expect(input.value).toBe('xyz');
    });
  });
  
  describe('Scene Integration Commands', () => {
    it('should display shape count', () => {
      const output = container.querySelector('.terminal-output');
      
      terminal.displayShapeCount();
      
      expect(output.textContent).toContain('Total shapes: 42');
      expect(output.textContent).toContain('sphere: 10');
      expect(output.textContent).toContain('cube: 8');
      expect(sceneManager.getShapeCount).toHaveBeenCalled();
    });
    
    it('should spawn shapes with valid type', () => {
      terminal.spawnShape(['sphere']);
      
      expect(sceneManager.spawnShape).toHaveBeenCalledWith('sphere');
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('Spawned new sphere');
    });
    
    it('should spawn random shape when no type specified', () => {
      terminal.spawnShape([]);
      
      expect(sceneManager.spawnShape).toHaveBeenCalled();
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toMatch(/Spawned new (sphere|cone|cylinder|torus|octahedron)/);
    });
    
    it('should reject invalid shape type', () => {
      terminal.spawnShape(['invalid']);
      
      expect(sceneManager.spawnShape).not.toHaveBeenCalled();
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain("Unknown shape type 'invalid'");
      expect(output.textContent).toContain('Available types:');
    });
    
    it('should toggle AABB visualization', () => {
      expect(terminal.showAABB).toBe(false);
      
      terminal.toggleAABB();
      
      expect(terminal.showAABB).toBe(true);
      expect(sceneManager.toggleAABB).toHaveBeenCalledWith(true);
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('AABB visualization: ENABLED');
    });
  });
  
  describe('UI Commands', () => {
    it('should clear terminal output', () => {
      const output = container.querySelector('.terminal-output');
      
      // Add some content
      terminal.addOutput('Test content');
      expect(output.children.length).toBeGreaterThan(1);
      
      // Clear
      terminal.clearTerminal();
      
      // Should only have welcome message
      expect(output.textContent).toContain('WELCOME TO THE CYBERSPACE TERMINAL');
    });
    
    it('should toggle FPS counter', () => {
      expect(terminal.fpsDisplay).toBeNull();
      
      terminal.toggleFPS();
      
      expect(terminal.fpsDisplay).toBeTruthy();
      expect(document.body.querySelector('.fps-counter')).toBeTruthy();
      
      // Toggle off
      terminal.toggleFPS();
      expect(terminal.fpsDisplay).toBeNull();
      expect(document.body.querySelector('.fps-counter')).toBeNull();
    });
    
    it('should hide UI elements except terminal', () => {
      // Create mock UI elements
      const mockContainer = document.createElement('div');
      mockContainer.className = 'container';
      document.body.appendChild(mockContainer);
      
      terminal.toggleUI();
      
      expect(terminal.uiHidden).toBe(true);
      expect(mockContainer.style.display).toBe('none');
      expect(terminal.container.style.position).toBe('fixed');
    });
  });
  
  describe('Terminal Controls', () => {
    it('should minimize terminal', () => {
      const minimizeBtn = container.querySelector('.minimize');
      
      minimizeBtn.click();
      
      expect(container.classList.contains('minimized')).toBe(true);
    });
    
    it('should maximize terminal', () => {
      const maximizeBtn = container.querySelector('.maximize');
      
      maximizeBtn.click();
      
      expect(container.classList.contains('maximized')).toBe(true);
    });
    
    it('should close terminal', () => {
      const closeBtn = container.querySelector('.close');
      
      closeBtn.click();
      
      expect(container.style.display).toBe('none');
    });
  });
  
  describe('Portfolio Commands', () => {
    it('should show about information', () => {
      terminal.showAbout();
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('James Ross - Cyber Architect');
      expect(output.textContent).toContain('distributed systems engineer');
    });
    
    it('should show skills', () => {
      terminal.showSkills();
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('Technical Arsenal');
      expect(output.textContent).toContain('JavaScript/TypeScript');
      expect(output.textContent).toContain('Three.js');
    });
    
    it('should show contact information', () => {
      terminal.showContact();
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('Contact Protocols');
      expect(output.textContent).toContain('Email:');
      expect(output.textContent).toContain('LinkedIn:');
    });
    
    it('should show projects', () => {
      terminal.showProjects();
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('Notable Projects');
      expect(output.textContent).toContain('Distributed MMO Backend');
      expect(output.textContent).toContain('Enterprise Analytics Platform');
    });
  });
  
  describe('Special Effects', () => {
    it('should activate matrix effect', () => {
      vi.useFakeTimers();
      
      terminal.enterMatrix();
      
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toContain('Entering the matrix...');
      
      // Fast forward through matrix animation
      vi.advanceTimersByTime(3000);
      
      expect(output.querySelectorAll('.matrix-rain').length).toBeGreaterThan(0);
      
      vi.useRealTimers();
    });
    
    it('should activate glitch effect', () => {
      vi.useFakeTimers();
      
      terminal.activateGlitch();
      
      expect(container.classList.contains('glitch')).toBe(true);
      const output = container.querySelector('.terminal-output');
      expect(output.textContent).toMatch(/G.*L.*I.*T.*C.*H/);
      
      // Should remove after 3 seconds
      vi.advanceTimersByTime(3000);
      expect(container.classList.contains('glitch')).toBe(false);
      
      vi.useRealTimers();
    });
  });
});