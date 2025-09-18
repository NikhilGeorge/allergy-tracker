#!/usr/bin/env node

/**
 * Mobile Responsiveness Verification Script
 * 
 * This script checks that the application is properly optimized for mobile devices
 * by verifying responsive design elements, touch targets, and mobile-specific features.
 */

const fs = require('fs');
const path = require('path');

class MobileVerifier {
  constructor() {
    this.checks = [];
    this.issues = [];
  }

  async runAllChecks() {
    console.log('📱 Verifying mobile responsiveness...\n');

    const checks = [
      { name: 'Viewport Configuration', check: () => this.checkViewportConfig() },
      { name: 'Responsive CSS Classes', check: () => this.checkResponsiveClasses() },
      { name: 'Touch Target Sizes', check: () => this.checkTouchTargets() },
      { name: 'Mobile Navigation', check: () => this.checkMobileNavigation() },
      { name: 'PWA Mobile Features', check: () => this.checkPWAMobileFeatures() },
      { name: 'Form Usability', check: () => this.checkMobileFormUsability() },
      { name: 'Image Optimization', check: () => this.checkImageOptimization() },
      { name: 'Performance Considerations', check: () => this.checkMobilePerformance() }
    ];

    for (const { name, check } of checks) {
      try {
        console.log(`⏳ Checking: ${name}`);
        await check();
        this.logSuccess(name);
      } catch (error) {
        this.logIssue(name, error.message);
      }
    }

    this.printSummary();
  }

  checkViewportConfig() {
    // Check layout.tsx for proper viewport configuration
    const layoutPath = 'src/app/layout.tsx';
    if (!fs.existsSync(layoutPath)) {
      throw new Error('Layout file not found');
    }

    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    if (!layoutContent.includes('viewport') && !layoutContent.includes('width=device-width')) {
      throw new Error('Viewport meta tag not properly configured');
    }

    // Check for mobile-specific viewport settings
    if (layoutContent.includes('viewport') && layoutContent.includes('width=device-width')) {
      // Good - viewport is configured
    } else {
      throw new Error('Viewport configuration incomplete');
    }
  }

  checkResponsiveClasses() {
    const componentDirs = ['src/components', 'src/app'];
    let hasResponsiveClasses = false;
    let checkedFiles = 0;

    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        this.checkDirectoryForResponsiveClasses(dir, (found) => {
          if (found) hasResponsiveClasses = true;
          checkedFiles++;
        });
      }
    }

    if (checkedFiles === 0) {
      throw new Error('No component files found to check');
    }

    if (!hasResponsiveClasses) {
      throw new Error('No responsive Tailwind classes found (sm:, md:, lg:, xl:)');
    }
  }

  checkDirectoryForResponsiveClasses(dir, callback) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.checkDirectoryForResponsiveClasses(filePath, callback);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasResponsive = /\b(sm|md|lg|xl|2xl):/g.test(content);
        callback(hasResponsive);
      }
    }
  }

  checkTouchTargets() {
    // Check for proper button and interactive element sizing
    const componentFiles = this.findComponentFiles();
    let hasTouchFriendlyElements = false;

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for touch-friendly sizing classes
      const touchFriendlyPatterns = [
        /p-[3-9]|px-[3-9]|py-[3-9]/, // Adequate padding
        /h-10|h-11|h-12|min-h-/, // Adequate height
        /w-10|w-11|w-12|min-w-/, // Adequate width
        /text-base|text-lg|text-xl/ // Readable text sizes
      ];

      const hasTouchFriendly = touchFriendlyPatterns.some(pattern => pattern.test(content));
      if (hasTouchFriendly) {
        hasTouchFriendlyElements = true;
        break;
      }
    }

    if (!hasTouchFriendlyElements) {
      throw new Error('No touch-friendly element sizing found');
    }
  }

  checkMobileNavigation() {
    // Check for mobile navigation components
    const sidebarPath = 'src/components/layout/Sidebar.tsx';
    const headerPath = 'src/components/layout/Header.tsx';

    if (!fs.existsSync(sidebarPath)) {
      throw new Error('Sidebar component not found');
    }

    if (!fs.existsSync(headerPath)) {
      throw new Error('Header component not found');
    }

    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    const headerContent = fs.readFileSync(headerPath, 'utf8');

    // Check for mobile menu indicators
    const mobileMenuPatterns = [
      /hamburger|menu.*button|mobile.*nav/i,
      /md:hidden|lg:hidden|xl:hidden/,
      /drawer|slide.*menu/i
    ];

    const hasMobileMenu = mobileMenuPatterns.some(pattern => 
      pattern.test(sidebarContent) || pattern.test(headerContent)
    );

    if (!hasMobileMenu) {
      throw new Error('Mobile navigation patterns not found');
    }
  }

  checkPWAMobileFeatures() {
    // Check manifest for mobile-specific features
    const manifestPath = 'public/manifest.json';
    if (!fs.existsSync(manifestPath)) {
      throw new Error('PWA manifest not found');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Check for mobile-friendly display mode
    if (!manifest.display || !['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) {
      throw new Error('Manifest display mode not mobile-friendly');
    }

    // Check for proper icons
    if (!manifest.icons || manifest.icons.length === 0) {
      throw new Error('No icons defined in manifest');
    }

    // Check for mobile icon sizes
    const mobileIconSizes = ['192x192', '512x512'];
    const hasRequiredSizes = mobileIconSizes.every(size => 
      manifest.icons.some(icon => icon.sizes === size)
    );

    if (!hasRequiredSizes) {
      throw new Error('Missing required mobile icon sizes (192x192, 512x512)');
    }
  }

  checkMobileFormUsability() {
    // Check form components for mobile usability
    const formPath = 'src/components/forms/IncidentForm.tsx';
    if (!fs.existsSync(formPath)) {
      throw new Error('Main form component not found');
    }

    const formContent = fs.readFileSync(formPath, 'utf8');

    // Check for mobile-friendly input types
    const mobileInputPatterns = [
      /type="datetime-local"/,
      /type="number"/,
      /inputMode/,
      /autoComplete/
    ];

    const hasMobileFriendlyInputs = mobileInputPatterns.some(pattern => 
      pattern.test(formContent)
    );

    if (!hasMobileFriendlyInputs) {
      throw new Error('Forms may not be optimized for mobile input');
    }
  }

  checkImageOptimization() {
    // Check for Next.js Image component usage
    const componentFiles = this.findComponentFiles();
    let hasImageOptimization = false;

    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('next/image') || content.includes('Image from')) {
        hasImageOptimization = true;
        break;
      }
    }

    // Check next.config.js for image optimization
    const nextConfigPath = 'next.config.js';
    if (fs.existsSync(nextConfigPath)) {
      const configContent = fs.readFileSync(nextConfigPath, 'utf8');
      if (configContent.includes('images') && configContent.includes('formats')) {
        hasImageOptimization = true;
      }
    }

    if (!hasImageOptimization) {
      throw new Error('Image optimization not properly configured');
    }
  }

  checkMobilePerformance() {
    // Check for performance optimizations
    const nextConfigPath = 'next.config.js';
    if (!fs.existsSync(nextConfigPath)) {
      throw new Error('Next.js config not found');
    }

    const configContent = fs.readFileSync(nextConfigPath, 'utf8');

    // Check for mobile performance features
    const performanceFeatures = [
      /optimizePackageImports/,
      /compress/,
      /swcMinify/
    ];

    const hasPerformanceOptimizations = performanceFeatures.some(pattern => 
      pattern.test(configContent)
    );

    if (!hasPerformanceOptimizations) {
      throw new Error('Mobile performance optimizations not found');
    }
  }

  findComponentFiles() {
    const files = [];
    const searchDirs = ['src/components', 'src/app'];

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.findFilesRecursively(dir, files, ['.tsx', '.ts']);
      }
    }

    return files;
  }

  findFilesRecursively(dir, files, extensions) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.findFilesRecursively(fullPath, files, extensions);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  logSuccess(checkName) {
    console.log(`✅ ${checkName}: PASS`);
    this.checks.push({ name: checkName, status: 'PASS' });
  }

  logIssue(checkName, issue) {
    console.log(`⚠️  ${checkName}: ISSUE - ${issue}`);
    this.checks.push({ name: checkName, status: 'ISSUE', issue });
    this.issues.push({ check: checkName, issue });
  }

  printSummary() {
    console.log('\n📊 Mobile Responsiveness Summary');
    console.log('=================================');
    
    const passed = this.checks.filter(c => c.status === 'PASS').length;
    const issues = this.checks.filter(c => c.status === 'ISSUE').length;
    const total = this.checks.length;
    
    console.log(`Total Checks: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Issues: ${issues} ⚠️`);
    
    if (issues > 0) {
      console.log('\n⚠️  Issues Found:');
      this.issues.forEach(({ check, issue }) => console.log(`  - ${check}: ${issue}`));
      
      console.log('\n📱 Mobile Optimization Recommendations:');
      console.log('1. Ensure all interactive elements are at least 44px in size');
      console.log('2. Use responsive breakpoints (sm:, md:, lg:, xl:)');
      console.log('3. Test on actual mobile devices');
      console.log('4. Optimize images for mobile bandwidth');
      console.log('5. Ensure forms work well with mobile keyboards');
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (issues === 0) {
      console.log('🎉 All mobile responsiveness checks passed!');
      console.log('📱 Your app should work great on mobile devices.');
    } else {
      console.log('⚠️  Some mobile optimization opportunities found.');
      console.log('Consider addressing these for the best mobile experience.');
    }
  }
}

// Main execution
async function main() {
  const verifier = new MobileVerifier();
  await verifier.runAllChecks();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MobileVerifier;