#!/usr/bin/env node

/**
 * Critiq Supabase Setup Verification Script
 * 
 * This script verifies that Supabase is properly configured and all
 * required tables, policies, and settings are in place.
 * 
 * Usage: node scripts/verify-supabase-setup.js
 */

const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, passMessage, failMessage) {
  if (condition) {
    log(`✓ ${passMessage}`, "green");
    return true;
  } else {
    log(`✗ ${failMessage}`, "red");
    return false;
  }
}

async function verifySetup() {
  log("\n📋 Critiq Supabase Setup Verification\n", "blue");

  let passed = 0;
  let failed = 0;

  // 1. Check environment variables
  log("1. Environment Variables", "blue");
  const envFile = path.join(process.cwd(), ".env.local");
  const envExists = fs.existsSync(envFile);

  if (check(envExists, ".env.local exists", ".env.local not found")) {
    passed++;
  } else {
    log("   → Run: cp .env.example .env.local", "yellow");
    failed++;
  }

  if (envExists) {
    const envContent = fs.readFileSync(envFile, "utf-8");

    if (
      check(
        envContent.includes("NEXT_PUBLIC_SUPABASE_URL") &&
          !envContent.includes("NEXT_PUBLIC_SUPABASE_URL=https://your"),
        "SUPABASE_URL configured",
        "SUPABASE_URL not configured properly"
      )
    ) {
      passed++;
    } else {
      failed++;
    }

    if (
      check(
        envContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") &&
          !envContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=your"),
        "SUPABASE_ANON_KEY configured",
        "SUPABASE_ANON_KEY not configured properly"
      )
    ) {
      passed++;
    } else {
      failed++;
    }

    if (
      check(
        envContent.includes("SUPABASE_SERVICE_ROLE_KEY") &&
          !envContent.includes("SUPABASE_SERVICE_ROLE_KEY=your"),
        "SUPABASE_SERVICE_ROLE_KEY configured",
        "SUPABASE_SERVICE_ROLE_KEY not configured properly"
      )
    ) {
      passed++;
    } else {
      failed++;
    }

    if (
      check(
        envContent.includes("GEMINI_API_KEY") &&
          !envContent.includes("GEMINI_API_KEY=your"),
        "GEMINI_API_KEY configured",
        "GEMINI_API_KEY not configured properly"
      )
    ) {
      passed++;
    } else {
      failed++;
    }
  }

  // 2. Check migration files
  log("\n2. Migration Files", "blue");
  const migrationsDir = path.join(process.cwd(), "supabase/migrations");
  const migrationExists = fs.existsSync(migrationsDir);

  if (
    check(
      migrationExists,
      "Migrations directory exists",
      "Migrations directory not found"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  if (migrationExists) {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
    if (
      check(
        files.length > 0,
        `Found ${files.length} migration file(s): ${files.join(", ")}`,
        "No migration files found"
      )
    ) {
      passed++;
    } else {
      failed++;
    }
  }

  // 3. Check Supabase configuration
  log("\n3. Supabase Configuration", "blue");
  const configPath = path.join(process.cwd(), "supabase/config.toml");
  const configExists = fs.existsSync(configPath);

  if (
    check(
      configExists,
      "supabase/config.toml exists",
      "supabase/config.toml not found"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // 4. Check Supabase clients
  log("\n4. Supabase Client Configuration", "blue");
  const clientPath = path.join(process.cwd(), "src/lib/supabase/client.ts");
  const serverPath = path.join(process.cwd(), "src/lib/supabase/server.ts");
  const adminPath = path.join(process.cwd(), "src/lib/supabase/admin.ts");

  if (
    check(
      fs.existsSync(clientPath),
      "Browser client configured",
      "Browser client not found"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  if (
    check(
      fs.existsSync(serverPath),
      "Server client configured",
      "Server client not found"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  if (
    check(
      fs.existsSync(adminPath),
      "Admin client configured",
      "Admin client not found"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // 5. Check service layer
  log("\n5. Service Layer", "blue");
  const servicesPath = path.join(process.cwd(), "src/lib/services");
  const serviceFiles = [
    "gemini-service.ts",
    "storage-service.ts",
    "analysis-repository.ts",
  ];

  serviceFiles.forEach((file) => {
    if (
      check(
        fs.existsSync(path.join(servicesPath, file)),
        `${file} exists`,
        `${file} not found`
      )
    ) {
      passed++;
    } else {
      failed++;
    }
  });

  // 6. Check API routes
  log("\n6. API Routes", "blue");
  const apiRoutes = [
    "src/app/api/analyze/route.ts",
    "src/app/api/upload/route.ts",
    "src/app/api/analyses/route.ts",
  ];

  apiRoutes.forEach((route) => {
    if (
      check(
        fs.existsSync(path.join(process.cwd(), route)),
        `${route.split("/").slice(-2).join("/")} exists`,
        `${route} not found`
      )
    ) {
      passed++;
    } else {
      failed++;
    }
  });

  // Summary
  log("\n" + "=".repeat(50), "blue");
  log(
    `\nSummary: ${passed} checks passed, ${failed} checks failed\n`,
    failed > 0 ? "red" : "green"
  );

  if (failed === 0) {
    log("✓ All checks passed! Supabase is ready to use.", "green");
    log("\nNext steps:", "blue");
    log("1. npm run dev");
    log("2. Visit http://localhost:3000");
    log("3. Sign up and test the application");
  } else {
    log("✗ Some checks failed. Please fix the issues above.", "red");
    log("\nSetup guide: See SUPABASE_SETUP.md for detailed instructions", "yellow");
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
verifySetup().catch((error) => {
  log(`\n✗ Verification error: ${error.message}`, "red");
  process.exit(1);
});
