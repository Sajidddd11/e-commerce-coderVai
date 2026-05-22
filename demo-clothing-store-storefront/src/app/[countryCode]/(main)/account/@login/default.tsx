// default.tsx — Fallback for the @login parallel route slot.
// When a user visits any account sub-route (e.g. /account/orders)
// while unauthenticated, Next.js uses this instead of 404-ing because
// @login has no matching sub-route page (only the root page.tsx exists).
// The layout then renders login (not dashboard) because customer === null.

import LoginTemplate from "@modules/account/templates/login-template"

export default function LoginDefault() {
  return <LoginTemplate />
}
