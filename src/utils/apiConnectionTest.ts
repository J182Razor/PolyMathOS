/**
 * API Connection Test Utility
 * Tests all backend API endpoints to verify connectivity
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ConnectionTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'timeout';
  message: string;
  responseTime?: number;
}

export class ApiConnectionTester {
  /**
   * Test a single endpoint
   */
  static async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const options: RequestInit = {
        method,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body && method === 'POST') {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          endpoint,
          status: 'success',
          message: `Connected (${response.status})`,
          responseTime,
        };
      } else {
        return {
          endpoint,
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      if (error.name === 'AbortError') {
        return {
          endpoint,
          status: 'timeout',
          message: 'Request timed out after 5 seconds',
          responseTime,
        };
      }

      return {
        endpoint,
        status: 'error',
        message: error.message || 'Connection failed',
        responseTime,
      };
    }
  }

  /**
   * Test all critical endpoints
   */
  static async testAllEndpoints(): Promise<ConnectionTestResult[]> {
    const endpoints = [
      { path: '/health', method: 'GET' as const },
      { path: '/api/agents/status', method: 'GET' as const },
      { path: '/api/agents/patterns', method: 'GET' as const },
      { path: '/api/workflows/zero/status', method: 'GET' as const },
      { path: '/api/hdam/health', method: 'GET' as const },
      { path: '/api/documents/formats', method: 'GET' as const },
      { path: '/api/research/status', method: 'GET' as const },
      { path: '/api/rag/status', method: 'GET' as const },
    ];

    const results = await Promise.all(
      endpoints.map(endpoint => this.testEndpoint(endpoint.path, endpoint.method))
    );

    return results;
  }

  /**
   * Get connection summary
   */
  static getSummary(results: ConnectionTestResult[]): {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  } {
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status !== 'success').length;
    const responseTimes = results
      .filter(r => r.responseTime)
      .map(r => r.responseTime!);
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    return {
      total: results.length,
      successful,
      failed,
      averageResponseTime: Math.round(averageResponseTime),
    };
  }
}

