#!/usr/bin/env node

/**
 * Pre-deployment Check Script
 * 
 * Validates that the application is ready for deployment by checking:
 * - Environment variables
 * - Build process
 * - Database connectivity
 * - Required files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreDeployChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  async runAllChecks() {
    console.log('🔍 Running pre-deployment checks...\n');

    const checks = [
      { name: 'Environment Variables', check: () => this.checkEnvironmentVariables() },
      { name: 'Required Files', check: () => this.checkRequiredFiles() },
      { name: 'Package Dependencies', check: () => this.checkDependencies() },
      { name: 'Build Process', check: () => this.checkBuildProcess() },
      { name: 'Database Schema', check: () => this.checkDatabaseFiles() },
      { name: 'PWA Configuration', check: () => this.checkPWAConfig() },
      { name: 'Security Configuration', check: () => this.checkSecurityConfig() },
      { name: 'Performance Configuration', check: () => this.checkPerformanceConfig() }
    ];

    for (const { name, check } of checks) {
      try {
        console.log(`⏳ Checking: ${name}`);
        await check();
        this.logSuccess(name);
      } catch (error) {
        this.logError(name, error.message);
      }
    }

    this.printSummary();
  }

  checkEnvironmentVariables() {
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    // Check .env.example exists
    if (!fs.existsSync('.env.example')) {
      throw new Error('.env.example file is missing');
    }

    // Check if .env.local exists (for development)
    if (!fs.existsSync('.env.local')) {
      this.warnings.push('No .env.local file found - make sure environment variables are set in production');
    }

    // If .env.local exists, check required variables
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const missingVars = requiredEnvVars.filter(varName => 
        !envContent.includes(varName) || envContent.includes(`${varName}=your-`)
      );

      if (missingVars.length > 0) {
        throw new Error(`Missing or placeholder environment variables: ${missingVars.join(', ')}`);
      }
    }
  }

  checkRequiredFiles() {
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'tailwind.config.ts',
      'tsconfig.json',
      'public/manifest.json',
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'vercel.json',
      'README.md',
      'DEPLOYMENT.md'
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    // Check if important directories exist
    const requiredDirs = [
      'src/app',
      'src/components',
      'src/hooks',
      'src/lib',
      'src/services',
      'src/types',
      'public',
      'supabase'
    ];

    const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
    
    if (missingDirs.length > 0) {
      throw new Error(`Missing required directories: ${missingDirs.join(', ')}`);
    }
  }

  checkDependencies() {
    try {
      // Check if package-lock.json exists
      if (!fs.existsSync('package-lock.json')) {
        this.warnings.push('No package-lock.json found - consider using npm ci for consistent builds');
      }

      // Check for security vulnerabilities
      try {
        execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      } catch (error) {
        this.warnings.push('npm audit found high-severity vulnerabilities - consider running npm audit fix');
      }

      // Verify critical dependencies
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const criticalDeps = [
        'next',
        'react',
        'react-dom',
        '@supabase/supabase-js',
        'tailwindcss'
      ];

      const missingDeps = criticalDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      );

      if (missingDeps.length > 0) {
        throw new Error(`Missing critical dependencies: ${missingDeps.join(', ')}`);
      }

    } catch (error) {
      if (error.message.includes('Missing critical dependencies')) {
        throw error;
      }
      // Other errors are warnings
      this.warnings.push(`Dependency check warning: ${error.message}`);
    }
  }

  checkBuildProcess() {
    try {
      console.log('  Building application...');
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check if .next directory was created
      if (!fs.existsSync('.next')) {
        throw new Error('Build did not create .next directory');
      }

      // Check for critical build outputs
      const buildOutputs = [
        '.next/static',
        '.next/server'
      ];

      const missingOutputs = buildOutputs.filter(output => !fs.existsSync(output));
      
      if (missingOutputs.length > 0) {
        throw new Error(`Build missing outputs: ${missingOutputs.join(', ')}`);
      }

    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  checkDatabaseFiles() {
    const dbFiles = [
      'supabase/config.toml',
      'supabase/migrations/001_initial_schema.sql'
    ];

    const missingDbFiles = dbFiles.filter(file => !fs.existsSync(file));
    
    if (missingDbFiles.length > 0) {
      throw new Error(`Missing database files: ${missingDbFiles.join(', ')}`);
    }

    // Check migration files have proper SQL
    const migrationFile = 'supabase/migrations/001_initial_schema.sql';
    const migrationContent = fs.readFileSync(migrationFile, 'utf8');
    
    if (!migrationContent.includes('CREATE TABLE') || !migrationContent.includes('incidents')) {
      throw new Error('Migration file appears to be incomplete or invalid');
    }
  }

  checkPWAConfig() {
    // Check manifest.json
    const manifestPath = 'public/manifest.json';
    if (!fs.existsSync(manifestPath)) {
      throw new Error('PWA manifest.json is missing');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const requiredManifestFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    
    const missingFields = requiredManifestFields.filter(field => !manifest[field]);
    if (missingFields.length > 0) {
      throw new Error(`Manifest missing fields: ${missingFields.join(', ')}`);
    }

    // Check next.config.js has PWA configuration
    const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
    if (!nextConfigContent.includes('next-pwa') && !nextConfigContent.includes('withPWA')) {
      throw new Error('next.config.js missing PWA configuration');
    }
  }

  checkSecurityConfig() {
    const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
    
    // Check for security headers
    if (!nextConfigContent.includes('headers')) {
      this.warnings.push('No security headers configured in next.config.js');
    }

    // Check for HTTPS enforcement
    if (!nextConfigContent.includes('Strict-Transport-Security')) {
      this.warnings.push('HSTS header not configured');
    }
  }

  checkPerformanceConfig() {
    const nextConfigContent = fs.readFileSync('next.config.js', 'utf8');
    
    // Check for image optimization
    if (!nextConfigContent.includes('images')) {
      this.warnings.push('Image optimization not configured');
    }

    // Check for compression
    if (!nextConfigContent.includes('compress')) {
      this.warnings.push('Compression not explicitly configured');
    }
  }

  logSuccess(checkName) {
    console.log(`✅ ${checkName}: PASS`);
    this.checks.push({ name: checkName, status: 'PASS' });
  }

  logError(checkName, error) {
    console.log(`❌ ${checkName}: FAIL - ${error}`);
    this.checks.push({ name: checkName, status: 'FAIL', error });
    this.errors.push({ check: checkName, error });
  }

  printSummary() {
    console.log('\n📊 Pre-deployment Check Summary');
    console.log('================================');
    
    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const failed = this.checks.filter(c => c.status === 'FAIL').length;
    const total = this.checks.length;
    
    console.log(`Total Checks: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Warnings: ${this.warnings.length} ⚠️`);
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (failed > 0) {
      console.log('\n❌ Failed Checks:');
      this.errors.forEach(({ check, error }) => console.log(`  - ${check}: ${error}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (failed === 0) {
      console.log('🎉 All checks passed! Your application is ready for deployment.');
      console.log('\nNext steps:');
      console.log('1. Set environment variables in your deployment platform');
      console.log('2. Deploy using: npm run deploy:vercel');
      console.log('3. Test deployment using: npm run test:deployment <url>');
      process.exit(0);
    } else {
      console.log('❌ Some checks failed. Please fix the issues before deploying.');
      console.log('\nRecommended actions:');
      console.log('1. Fix the failed checks listed above');
      console.log('2. Run this script again to verify fixes');
      console.log('3. Address any warnings for optimal deployment');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const checker = new PreDeployChecker();
  await checker.runAllChecks();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = PreDeployChecker;