# React Composition Patterns

_Read-only reference · Distilled from `vercel-composition-patterns`_

## When to Load

| Task | Load? |
|---|---|
| Designing component architecture for Stage 2 primitives | **Yes** |
| Building reusable compound components | **Yes** |
| Refactoring boolean-prop-heavy components | **Yes** |
| Managing shared state across sibling components | **Yes** |
| Writing native module code | No |
| Configuring motion/animation | No |

---

## 1. Avoid Boolean Prop Proliferation (CRITICAL)

Each boolean prop doubles possible states. Use composition instead.

```tsx
// BAD: 4 booleans = 16 possible states
<Composer isThread isDMThread={false} isEditing isForwarding={false} />

// GOOD: explicit variants
<ThreadComposer channelId="abc" />
<EditComposer messageId="xyz" />
<ForwardComposer messageId="123" />
```

Each variant composes exactly the pieces it needs. No hidden conditionals.

---

## 2. Compound Components

Structure complex components with shared context, not prop drilling.

```tsx
// Define context
const ComposerContext = createContext<ComposerContextValue | null>(null)

// Provider
function ComposerProvider({ children, state, actions, meta }) {
    return (
        <ComposerContext value={{ state, actions, meta }}>
            {children}
        </ComposerContext>
    )
}

// Subcomponents access context
function ComposerInput() {
    const { state, actions: { update }, meta } = use(ComposerContext)
    return (
        <TextInput
            ref={meta.inputRef}
            value={state.input}
            onChangeText={text => update(s => ({ ...s, input: text }))}
        />
    )
}

function ComposerSubmit() {
    const { actions: { submit } } = use(ComposerContext)
    return <Button onPress={submit}>Send</Button>
}

// Export as compound
const Composer = {
    Provider: ComposerProvider,
    Frame: ComposerFrame,
    Input: ComposerInput,
    Submit: ComposerSubmit,
    Header: ComposerHeader,
    Footer: ComposerFooter,
}
```

### Usage

```tsx
<Composer.Provider state={state} actions={actions} meta={meta}>
    <Composer.Frame>
        <Composer.Header />
        <Composer.Input />
        <Composer.Footer>
            <Composer.Submit />
        </Composer.Footer>
    </Composer.Frame>
</Composer.Provider>
```

---

## 3. Generic Context Interface (Dependency Injection)

Define a generic interface with three parts: **state**, **actions**, **meta**.

```tsx
interface ComposerState {
    input: string
    attachments: Attachment[]
    isSubmitting: boolean
}

interface ComposerActions {
    update: (updater: (state: ComposerState) => ComposerState) => void
    submit: () => void
}

interface ComposerMeta {
    inputRef: React.RefObject<TextInput>
}
```

Different providers implement the same interface:

```tsx
// Local state for ephemeral forms
function ForwardMessageProvider({ children }) {
    const [state, setState] = useState(initialState)
    const submit = useForwardMessage()
    return (
        <ComposerContext value={{ state, actions: { update: setState, submit }, meta: {} }}>
            {children}
        </ComposerContext>
    )
}

// Global synced state for channels
function ChannelProvider({ channelId, children }) {
    const { state, update, submit } = useGlobalChannel(channelId)
    return (
        <ComposerContext value={{ state, actions: { update, submit }, meta: {} }}>
            {children}
        </ComposerContext>
    )
}
```

Same `Composer.Input` works with both providers.

---

## 4. Lift State Into Providers

Components that need shared state don't need to be visually nested — just within the provider:

```tsx
function ForwardMessageDialog() {
    return (
        <ForwardMessageProvider>
            <Dialog>
                <Composer.Frame>
                    <Composer.Input />
                </Composer.Frame>

                {/* OUTSIDE Composer.Frame but INSIDE provider */}
                <MessagePreview />

                <DialogActions>
                    <CancelButton />
                    <ForwardButton /> {/* Can access submit */}
                </DialogActions>
            </Dialog>
        </ForwardMessageProvider>
    )
}

function ForwardButton() {
    const { actions: { submit } } = use(ComposerContext)
    return <Button onPress={submit}>Forward</Button>
}
```

**Key insight**: Provider boundary is what matters, not visual nesting.

---

## 5. Explicit Component Variants

```tsx
function ThreadComposer({ channelId }: { channelId: string }) {
    return (
        <ThreadProvider channelId={channelId}>
            <Composer.Frame>
                <Composer.Input />
                <AlsoSendToChannelField channelId={channelId} />
                <Composer.Footer>
                    <Composer.Formatting />
                    <Composer.Submit />
                </Composer.Footer>
            </Composer.Frame>
        </ThreadProvider>
    )
}

function EditMessageComposer({ messageId }: { messageId: string }) {
    return (
        <EditMessageProvider messageId={messageId}>
            <Composer.Frame>
                <Composer.Input />
                <Composer.Footer>
                    <Composer.CancelEdit />
                    <Composer.SaveEdit />
                </Composer.Footer>
            </Composer.Frame>
        </EditMessageProvider>
    )
}
```

Each variant is explicit about what provider, what children, and what layout.

---

## 6. React 19 API Notes

- `use(Context)` replaces `useContext(Context)`.
- `ref` is a regular prop (no `forwardRef` needed).
- `React.use(promise)` for suspenseful data access.
- `useFormStatus`, `useFormState`, `useOptimistic` for form handling.

---

## 7. Rules Summary

1. **No boolean props** — Create explicit variants instead.
2. **Compound components** — Shared context, composed children.
3. **Generic interface** — `state` + `actions` + `meta` contract.
4. **Lift state** — Provider boundary > visual boundary.
5. **Decouple UI from state** — Provider knows implementation; UI knows interface.
6. **Compose children** — Prefer children over render props.
7. **One variant = one file** — Self-documenting, no hidden conditionals.

---

## Skill Sources

- `vercel-composition-patterns/AGENTS.md` (compound components, state lifting, variants)
- `vercel-react-native-skills/AGENTS.md` (design system section)
