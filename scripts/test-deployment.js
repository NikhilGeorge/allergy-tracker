#!/usr/bin/env node

/**
 * Deployment Testing Script
 * 
 * This script performs comprehensive testing of the deployed application
 * to ensure all functionality works correctly in production.
 */

const https = require('https');
const http = require('http');

class DeploymentTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.results = [];
  }

  async runAllTests() {
    console.log(`🚀 Starting deployment tests for: ${this.baseUrl}\n`);

    const tests = [
      { name: 'Health Check', test: () => this.testHealthCheck() },
      { name: 'Homepage Load', test: () => this.testPageLoad('/') },
      { name: 'Dashboard Load', test: () => this.testPageLoad('/dashboard') },
      { name: 'Incidents Page', test: () => this.testPageLoad('/incidents') },
      { name: 'New Incident Form', test: () => this.testPageLoad('/incidents/new') },
      { name: 'Auth Pages', test: () => this.testAuthPages() },
      { name: 'PWA Manifest', test: () => this.testPWAManifest() },
      { name: 'Service Worker', test: () => this.testServiceWorker() },
      { name: 'API Endpoints', test: () => this.testAPIEndpoints() },
      { name: 'Static Assets', test: () => this.testStaticAssets() },
      { name: 'Performance Headers', test: () => this.testPerformanceHeaders() },
      { name: 'Security Headers', test: () => this.testSecurityHeaders() }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`⏳ Testing: ${name}`);
        await test();
        this.logResult(name, 'PASS', '✅');
      } catch (error) {
        this.logResult(name, 'FAIL', '❌', error.message);
      }
    }

    this.printSummary();
  }

  async testHealthCheck() {
    const response = await this.makeRequest('/api/health');
    if (response.statusCode !== 200) {
      throw new Error(`Health check failed with status ${response.statusCode}`);
    }

    const data = JSON.parse(response.body);
    if (data.status !== 'healthy') {
      throw new Error(`Health check returned status: ${data.status}`);
    }
  }

  async testPageLoad(path) {
    const response = await this.makeRequest(path);
    if (response.statusCode !== 200) {
      throw new Error(`Page ${path} returned status ${response.statusCode}`);
    }

    if (!response.body.includes('<!DOCTYPE html>')) {
      throw new Error(`Page ${path} does not return valid HTML`);
    }
  }

  async testAuthPages() {
    const authPages = ['/auth/signin', '/auth/signup'];

    for (const page of authPages) {
      const response = await this.makeRequest(page);
      if (response.statusCode !== 200) {
        throw new Error(`Auth page ${page} returned status ${response.statusCode}`);
      }
    }
  }

  async testPWAManifest() {
    const response = await this.makeRequest('/manifest.json');
    if (response.statusCode !== 200) {
      throw new Error(`Manifest not found (status ${response.statusCode})`);
    }

    const manifest = JSON.parse(response.body);
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];

    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`Manifest missing required field: ${field}`);
      }
    }
  }

  async testServiceWorker() {
    const response = await this.makeRequest('/sw.js');
    if (response.statusCode !== 200) {
      throw new Error(`Service worker not found (status ${response.statusCode})`);
    }

    if (!response.body.includes('workbox') && !response.body.includes('self.addEventListener')) {
      throw new Error('Service worker does not appear to be valid');
    }
  }

  async testAPIEndpoints() {
    // Test health endpoint specifically
    const healthResponse = await this.makeRequest('/healthz');
    if (healthResponse.statusCode !== 200) {
      throw new Error(`Health endpoint /healthz returned status ${healthResponse.statusCode}`);
    }
  }

  async testStaticAssets() {
    const assets = ['/favicon.ico'];

    for (const asset of assets) {
      const response = await this.makeRequest(asset);
      if (response.statusCode !== 200 && response.statusCode !== 404) {
        // 404 is acceptable for optional assets
        throw new Error(`Asset ${asset} returned unexpected status ${response.statusCode}`);
      }
    }
  }

  async testPerformanceHeaders() {
    const response = await this.makeRequest('/');
    const headers = response.headers;

    // Check for important performance headers
    const performanceHeaders = [
      'x-dns-prefetch-control',
      'strict-transport-security'
    ];

    const missingHeaders = performanceHeaders.filter(header => !headers[header]);
    if (missingHeaders.length > 0) {
      console.warn(`⚠️  Missing performance headers: ${missingHeaders.join(', ')}`);
    }
  }

  async testSecurityHeaders() {
    const response = await this.makeRequest('/');
    const headers = response.headers;

    // Check for important security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy'
    ];

    const missingHeaders = securityHeaders.filter(header => !headers[header]);
    if (missingHeaders.length > 0) {
      console.warn(`⚠️  Missing security headers: ${missingHeaders.join(', ')}`);
    }
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const isHttps = url.startsWith('https:');
      const client = isHttps ? https : http;

      const request = client.get(url, (response) => {
        let body = '';

        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: body
          });
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  logResult(testName, status, icon, error = null) {
    const result = { testName, status, error };
    this.results.push(result);

    if (status === 'PASS') {
      console.log(`${icon} ${testName}: ${status}`);
    } else {
      console.log(`${icon} ${testName}: ${status} - ${error}`);
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.testName}: ${r.error}`));
    }

    console.log('\n🎉 Deployment testing complete!');

    if (failed === 0) {
      console.log('🚀 All tests passed! Your deployment is ready for production.');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review and fix the issues before going live.');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2];

  if (!baseUrl) {
    console.error('Usage: node test-deployment.js <base-url>');
    console.error('Example: node test-deployment.js https://your-app.vercel.app');
    process.exit(1);
  }

  const tester = new DeploymentTester(baseUrl);
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentTester;