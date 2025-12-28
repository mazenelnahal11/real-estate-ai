# Development Challenges & Solutions

## 1. Tailwind CSS v4 Configuration
**Issue:** The project initially struggled with Tailwind CSS v4 integration. The deprecated `npx tailwindcss` command from v3 caused build failures, and the `tailwind.config.js` file structure was not fully compatible with v4's CSS-first approach.
**Solution:**
- Switched to the dedicated `@tailwindcss/cli` package.
- Refactored `input.css` to use the new `@theme` directive for defining custom variables (Deep Black, Off-White).
- Updated the build script to use the correct CLI command.

## 2. Duplicate HTML Structure
**Issue:** `dashboard.ejs` contained a duplicate `<!DOCTYPE html>` and `<head>` section, likely resulting from a previous merge or copy-paste error. This caused invalid DOM rendering and potential script execution issues.
**Solution:**
- Manually identified and removed the redundant top 38 lines of the file.
- Consolidated all necessary scripts (Tailwind Config, Chart.js) into a single valid `<head>` section.

## 3. Theme Consistency ("The Emerald Purge")
**Issue:** Despite changing the global CSS to a monochromatic theme, "Emerald" green accents persisted in chart colors, dynamically generated table rows (via JavaScript), and specific UI badges.
**Solution:**
- **Global Mapping:** Mapped `emerald` to `zinc` in the Tailwind configuration to instantly neutralize overlooked classes.
- **Manual Overrides:** rewrote the inline JavaScript logic in `dashboard.ejs` and `chat.ejs` to generate `zinc` and `white` classes instead of `emerald` and `blue`.
- **Chart.js Update:** Updated the Chart.js dataset configuration to use a Zinc-based gradient instead of Green.

## 4. Dark Mode & Shadow Visibility
**Issue:** Standard shadows were invisible on the new "Deep Black" (`#000000`) background, flattening the UI depth in Dark Mode.
**Solution:**
- Introduced `border-zinc-800` highlights for dark mode cards to define edges.
- Boosted shadow intensity to `shadow-2xl` globally.
- Used high-contrast "White on Black" schemes for active elements to ensure visibility without relying on color.

## 5. Routing Confusion
**Issue:** Attempts to access `GET /login` resulted in 404 errors.
**Solution:**
- Verified that the application uses `GET /` as the login entry point and `POST /login` for the action.
- No code change required, but clarified the routing architecture.
