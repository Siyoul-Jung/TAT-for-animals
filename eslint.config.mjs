import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Apostrophes/quotes inside English copy ("don't", "you're") are fine and
      // readable in source — this rule is pure stylistic noise, not a real bug.
      "react/no-unescaped-entities": "off",
      // A performance hint (cascading renders), not a correctness bug. The
      // existing uses are intentional "reset this state when the route changes"
      // patterns (documented in-place, e.g. Pricing/TrySession). Keep it visible
      // as a warning so new cases surface, but don't fail the build on it.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
