#!/usr/bin/env node

/**
 * Supabase Authentication Setup Validator
 * Run: node validate-setup.js
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, successMsg, failMsg) {
  if (condition) {
    log(`✓ ${successMsg}`, "green");
    return true;
  } else {
    log(`✗ ${failMsg}`, "red");
    return false;
  }
}

function main() {
  log("\n🔍 Crop2Cart Authentication Setup Validator\n", "cyan");

  let allGood = true;

  // Check .env.local exists
  const envPath = path.join(__dirname, ".env.local");
  if (!check(fs.existsSync(envPath), ".env.local exists", ".env.local NOT found")) {
    log("   → Create .env.local in project root", "yellow");
    return;
  }

  // Read .env.local
  const envContent = fs.readFileSync(envPath, "utf8");

  // Parse environment variables
  const env = {};
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !line.startsWith("#")) {
      env[match[1]] = match[2];
    }
  });

  log("\n📋 Environment Variables Check:\n", "blue");

  // Check SUPABASE_URL
  allGood &= check(
    env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL is set",
    "NEXT_PUBLIC_SUPABASE_URL is missing"
  );
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const isValid = url.includes("supabase.co");
    allGood &= check(
      isValid,
      `Valid URL format: ${url.substring(0, 40)}...`,
      `Invalid URL format: ${url}`
    );
  }

  // Check Anon Key
  allGood &= check(
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is set",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
  );
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isJWT = key.split(".").length === 3;
    allGood &= check(
      isJWT,
      `Valid JWT format (3 parts): ${key.substring(0, 30)}...`,
      `Invalid format: ${key.split(".").length} parts`
    );
  }

  // Check Service Role Key
  allGood &= check(
    env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY is set",
    "SUPABASE_SERVICE_ROLE_KEY is missing"
  );
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    const isJWT = key.split(".").length === 3;
    const hasQuote = key.includes('"');
    
    allGood &= check(
      isJWT && !hasQuote,
      `Valid JWT format (3 parts): ${key.substring(0, 30)}...`,
      `Invalid format: ${key.split(".").length} parts${hasQuote ? " (contains quote)" : ""}`
    );

    if (hasQuote) {
      log("   ⚠️  WARNING: Service role key contains quote character!", "yellow");
      log("   → Get fresh key from Supabase Settings → API", "yellow");
    }
  }

  // Check Resend Key
  allGood &= check(
    env.RESEND_API_KEY,
    "RESEND_API_KEY is set",
    "RESEND_API_KEY is missing"
  );

  // Check PASSWORD_SALT
  allGood &= check(
    env.PASSWORD_SALT && env.PASSWORD_SALT.length >= 32,
    `PASSWORD_SALT is set (${env.PASSWORD_SALT ? env.PASSWORD_SALT.length : 0} chars)`,
    "PASSWORD_SALT is missing or too short"
  );

  // Check JWT_SECRET
  allGood &= check(
    env.JWT_SECRET && env.JWT_SECRET.length >= 32,
    `JWT_SECRET is set (${env.JWT_SECRET ? env.JWT_SECRET.length : 0} chars)`,
    "JWT_SECRET is missing or too short"
  );

  log("\n📦 File Structure Check:\n", "blue");

  // Check required files
  const files = [
    "app/api/auth/signup/route.ts",
    "app/api/auth/signin/route.ts",
    "app/api/auth/verify-signup-otp/route.ts",
    "components/otp-auth-modal.tsx",
    "components/home-header.tsx",
    "SUPABASE_AUTH_SCHEMA.sql",
  ];

  files.forEach((file) => {
    const filePath = path.join(__dirname, file);
    check(
      fs.existsSync(filePath),
      `${file} exists`,
      `${file} NOT found`
    );
  });

  log("\n" + "=".repeat(60), "cyan");
  if (allGood) {
    log("✓ All checks passed! Setup looks good.", "green");
    log("\nNext steps:", "cyan");
    log("1. Verify all tables exist in Supabase (run SUPABASE_AUTH_SCHEMA.sql)", "yellow");
    log("2. Start dev server: npm run dev", "yellow");
    log("3. Test signup at http://localhost:3002/home", "yellow");
  } else {
    log("✗ Some checks failed. Please fix the issues above.", "red");
    log("\nCommon fixes:", "yellow");
    log("• Get fresh API keys from https://app.supabase.com → Settings → API", "yellow");
    log("• Make sure .env.local has no quotes around values", "yellow");
    log("• Run SUPABASE_AUTH_SCHEMA.sql in Supabase SQL Editor", "yellow");
  }
  log("=".repeat(60) + "\n", "cyan");
}

main();
