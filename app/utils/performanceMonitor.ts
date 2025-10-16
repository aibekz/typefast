/**
 * Performance monitoring utilities for typing test
 */

interface PerformanceMetrics {
  renderTime: number;
  keystrokeLatency: number;
  memoryUsage: number;
  componentRenders: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    keystrokeLatency: 0,
    memoryUsage: 0,
    componentRenders: 0,
  };

  private renderStartTime = 0;
  private keystrokeStartTime = 0;
  private renderCount = 0;

  startRender() {
    this.renderStartTime = performance.now();
  }

  endRender() {
    if (this.renderStartTime > 0) {
      this.metrics.renderTime = performance.now() - this.renderStartTime;
      this.renderCount++;
      this.metrics.componentRenders = this.renderCount;
    }
  }

  startKeystroke() {
    this.keystrokeStartTime = performance.now();
  }

  endKeystroke() {
    if (this.keystrokeStartTime > 0) {
      this.metrics.keystrokeLatency = performance.now() - this.keystrokeStartTime;
    }
  }

  updateMemoryUsage() {
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      renderTime: 0,
      keystrokeLatency: 0,
      memoryUsage: 0,
      componentRenders: 0,
    };
    this.renderCount = 0;
  }

  logMetrics() {
    console.group('🚀 Typing Test Performance');
    console.log(`Render Time: ${this.metrics.renderTime.toFixed(2)}ms`);
    console.log(`Keystroke Latency: ${this.metrics.keystrokeLatency.toFixed(2)}ms`);
    console.log(`Component Renders: ${this.metrics.componentRenders}`);
    console.log(`Memory Usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.groupEnd();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startRender = () => performanceMonitor.startRender();
  const endRender = () => performanceMonitor.endRender();
  const startKeystroke = () => performanceMonitor.startKeystroke();
  const endKeystroke = () => performanceMonitor.endKeystroke();
  const getMetrics = () => performanceMonitor.getMetrics();
  const logMetrics = () => performanceMonitor.logMetrics();
  const reset = () => performanceMonitor.reset();

  return {
    startRender,
    endRender,
    startKeystroke,
    endKeystroke,
    getMetrics,
    logMetrics,
    reset,
  };
};
