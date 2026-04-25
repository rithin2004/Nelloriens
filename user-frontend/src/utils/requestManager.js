/**
 * Simple Request Manager to prevent race conditions.
 * Tracks the latest requestId for each module.
 */
class RequestManager {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Generates a new unique requestId for a given module and returns it.
   * @param {string} moduleName 
   * @returns {number} The new requestId
   */
  getNextId(moduleName) {
    const current = this.requests.get(moduleName) || 0;
    const next = current + 1;
    this.requests.set(moduleName, next);
    return next;
  }

  /**
   * Checks if the provided requestId is still the latest for that module.
   * @param {string} moduleName 
   * @param {number} requestId 
   * @returns {boolean} True if the request is still valid/latest
   */
  isValid(moduleName, requestId) {
    return this.requests.get(moduleName) === requestId;
  }
}

export const requestManager = new RequestManager();
