# Flow Examples

Concrete flow patterns demonstrating Agent UI semantic flow authoring and execution.

## Example 1: Tap Button and Verify State

```ts
const settingsFlow: SemanticFlow = {
  name: "Toggle notifications setting",
  description: "Open settings, toggle notifications on, verify state change",
  steps: [
    { type: "tap", id: "settings-nav-btn" },
    { type: "waitFor", conditions: [{ kind: "nodeVisible", nodeId: "settings-screen" }], timeoutMs: 3000 },
    { type: "tap", id: "settings-notifications-toggle" },
    { type: "assert", id: "settings-notifications-toggle", state: { checked: true } },
    { type: "tap", id: "settings-save-btn" },
  ],
  assertions: [
    { description: "Notifications toggle is on", check: "nodeState", nodeId: "settings-notifications-toggle", expected: { checked: true } }
  ],
  stopOnFailure: true
};
```

## Example 2: Fill Form and Submit

```ts
const loginFlow: SemanticFlow = {
  name: "User login",
  steps: [
    { type: "tap", id: "login-email-field" },
    { type: "input", id: "login-email-field", value: "user@example.com" },
    { type: "tap", id: "login-password-field" },
    { type: "input", id: "login-password-field", value: "********" },
    { type: "tap", id: "login-submit-btn" },
    { type: "waitFor", conditions: [{ kind: "nodeVisible", nodeId: "home-screen" }], timeoutMs: 5000 },
  ],
  assertions: [
    { description: "Home screen appears after login", check: "nodeVisible", nodeId: "home-screen" }
  ],
  stopOnFailure: true
};
```

## Example 3: Wait for Screen Transition

```ts
const navigationFlow: SemanticFlow = {
  name: "Navigate to profile",
  steps: [
    { type: "tap", id: "tab-profile" },
    { type: "waitFor", conditions: [
      { kind: "nodeVisible", nodeId: "profile-screen" },
      { kind: "nodeExists", nodeId: "profile-name-text" }
    ], timeoutMs: 5000 },
    { type: "assert", id: "profile-screen", state: { active: true } },
  ],
  stopOnFailure: true
};
```

## Example 4: Export to Maestro YAML

Given an Agent UI semantic flow, the generated Maestro YAML:

```yaml
appId: com.example.app
---
# Flow: User login
- tapOn:
    id: "login-email-field"
- inputText: "user@example.com"
- tapOn:
    id: "login-password-field"
- inputText: "********"
- tapOn:
    id: "login-submit-btn"
- assertVisible:
    id: "home-screen"
```

Key mapping rules:
- `tap` → `tapOn` with `id` selector
- `input` → `inputText` (uses the `id` from the preceding tap or an explicit `id`)
- `waitFor` nodeVisible → `assertVisible`
- `navigate` → handled by MCP; not exported to YAML (screen flow is app-internal)
- `assert` → corresponding Maestro assert command

## Example 5: Healing a Failed Selector

Scenario: The login button ID changed from `"login-submit-btn"` to `"login-confirm-btn"`.

Maestro reports:
```
Assertion failed: id "login-submit-btn" not found on screen
```

Agent UI healing proposal:
```ts
{
  type: "healing_proposal",
  failedSelector: { type: "id", value: "login-submit-btn" },
  candidates: [
    { id: "login-confirm-btn", confidence: 0.95, reason: "same role (button), same parent (login-form), similar label match" },
    { id: "signup-submit-btn", confidence: 0.12, reason: "same role (button), different parent" }
  ],
  suggestedFix: {
    file: "flows/login.flow.ts",
    line: 7,
    oldId: "login-submit-btn",
    newId: "login-confirm-btn",
  }
}
```

The healing proposal must be reviewed and approved before any source file is modified.
