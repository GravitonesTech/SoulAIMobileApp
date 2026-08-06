// DOMException polyfill for React Native / Hermes
if (typeof global.DOMException === "undefined") {
  function DOMException(this: any, message?: string, name?: string) {
    this.message = message || "";
    this.name = name || "Error";
    const error = new Error(this.message);
    this.stack = error.stack;
  }
  DOMException.prototype = Object.create(Error.prototype);
  DOMException.prototype.constructor = DOMException;

  (global as any).DOMException = DOMException;
  if (typeof globalThis !== "undefined") {
    (globalThis as any).DOMException = DOMException;
  }
}

// PerformanceEntry polyfill for React Native / Hermes
if (typeof global.PerformanceEntry === "undefined") {
  function PerformanceEntry(this: any, init?: any) {
    this.name = init?.name || "";
    this.entryType = init?.entryType || "";
    this.startTime = init?.startTime || 0;
    this.duration = init?.duration || 0;
  }
  PerformanceEntry.prototype.toJSON = function () {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
    };
  };

  (global as any).PerformanceEntry = PerformanceEntry;
  if (typeof globalThis !== "undefined") {
    (globalThis as any).PerformanceEntry = PerformanceEntry;
  }
}

// PerformanceMark polyfill for React Native / Hermes
if (typeof global.PerformanceMark === "undefined") {
  function PerformanceMark(this: any, name?: string, options?: any) {
    this.name = name || "";
    this.entryType = "mark";
    this.startTime = options?.startTime || 0;
    this.duration = 0;
    this.detail = options?.detail || null;
  }
  if (typeof global.PerformanceEntry !== "undefined") {
    PerformanceMark.prototype = Object.create((global as any).PerformanceEntry.prototype);
  } else {
    PerformanceMark.prototype = Object.create(Object.prototype);
  }
  PerformanceMark.prototype.constructor = PerformanceMark;

  (global as any).PerformanceMark = PerformanceMark;
  if (typeof globalThis !== "undefined") {
    (globalThis as any).PerformanceMark = PerformanceMark;
  }
}

// PerformanceMeasure polyfill for React Native / Hermes
if (typeof global.PerformanceMeasure === "undefined") {
  function PerformanceMeasure(this: any, name?: string, options?: any) {
    this.name = name || "";
    this.entryType = "measure";
    this.startTime = options?.startTime || 0;
    this.duration = options?.duration || 0;
    this.detail = options?.detail || null;
  }
  if (typeof global.PerformanceEntry !== "undefined") {
    PerformanceMeasure.prototype = Object.create((global as any).PerformanceEntry.prototype);
  } else {
    PerformanceMeasure.prototype = Object.create(Object.prototype);
  }
  PerformanceMeasure.prototype.constructor = PerformanceMeasure;

  (global as any).PerformanceMeasure = PerformanceMeasure;
  if (typeof globalThis !== "undefined") {
    (globalThis as any).PerformanceMeasure = PerformanceMeasure;
  }
}
