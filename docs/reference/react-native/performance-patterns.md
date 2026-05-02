# React Native Performance Patterns

_Read-only reference · Distilled from `vercel-react-native-skills`_

## When to Load

| Task | Load? |
|---|---|
| Building list-heavy UI components | **Yes** |
| Debugging scroll jank or render performance | **Yes** |
| Reviewing component render efficiency | **Yes** |
| Writing animation code | **Yes** — animation section |
| Writing Expo native module code | No |
| Configuring EAS builds | No |

---

## 1. Core Rendering (CRITICAL)

### Never Use `&&` with Falsy Values

```tsx
// BAD: crashes if count is 0 or name is ""
{count && <Text>{count} items</Text>}

// GOOD: ternary with null
{count ? <Text>{count} items</Text> : null}

// GOOD: explicit boolean
{!!count && <Text>{count} items</Text>}
```

### Wrap Strings in Text

```tsx
// BAD: crashes
<View>Hello, {name}!</View>

// GOOD
<View><Text>Hello, {name}!</Text></View>
```

---

## 2. List Performance (HIGH)

### Always Use a Virtualizer

```tsx
// BAD: ScrollView renders ALL items
<ScrollView>
    {items.map(item => <ItemCard key={item.id} item={item} />)}
</ScrollView>

// GOOD: Only ~10-15 visible items mounted
<LegendList
    data={items}
    renderItem={({ item }) => <ItemCard item={item} />}
    keyExtractor={item => item.id}
    estimatedItemSize={80}
/>
```

Use LegendList or FlashList for any list, even short ones.

### Keep List Items Lightweight

- ❌ No queries or data fetching inside list items.
- ❌ No expensive computations.
- ❌ Minimize useState/useEffect hooks.
- ✅ Pass pre-computed primitives as props.
- ✅ Use Zustand selectors over React Context.

### Stable Object References

```tsx
// BAD: new objects on every keystroke
const domains = tlds.map(tld => ({ domain: `${keyword}.${tld.name}` }))
<LegendList data={domains} />

// GOOD: stable references, transform inside items
<LegendList data={tlds} renderItem={({ item }) => <DomainItem tld={item} />} />

function DomainItem({ tld }) {
    const domain = useKeywordStore(s => s.keyword + '.' + tld.name)
    return <Text>{domain}</Text>
}
```

### Pass Primitives for Memoization

```tsx
// BAD: object prop, shallow comparison fails
<UserRow user={item} />

// GOOD: primitives enable effective memo()
<UserRow id={item.id} name={item.name} email={item.email} />
```

### Use Item Types for Heterogeneous Lists

```tsx
<LegendList
    data={items}
    getItemType={item => item.type}
    renderItem={({ item }) => {
        switch (item.type) {
            case 'header': return <HeaderItem title={item.title} />
            case 'message': return <MessageItem text={item.text} />
            case 'image': return <ImageItem url={item.url} />
        }
    }}
/>
```

### Compressed Images in Lists
- Request images at 2× display size for retina.
- Use image CDN resize parameters (`?w=200&h=200&fit=cover`).
- Use `expo-image` for built-in caching.

---

## 3. Animation (HIGH)

### Animate Transform, Not Layout

```tsx
// BAD: triggers layout recalculation
style={{ width: expanded ? 320 : 200 }}

// GOOD: composited transform
style={{ transform: [{ scale: expanded ? 1.1 : 1 }] }}
```

### Prefer `useDerivedValue` Over `useAnimatedReaction`
- `useDerivedValue` is simpler and more efficient for derived animated values.
- `useAnimatedReaction` for side effects only (haptics, logging).

### Use GestureDetector for Press States

```tsx
const gesture = Gesture.Pan()
    .onUpdate(e => { translateX.value = e.translationX })
    .onEnd(() => { translateX.value = withSpring(0) })

<GestureDetector gesture={gesture}>
    <Animated.View style={animatedStyle} />
</GestureDetector>
```

---

## 4. Scroll Performance (HIGH)

### Never Track Scroll in useState

```tsx
// BAD: re-renders entire component tree on scroll
const [scroll, setScroll] = useState(0)
onScroll={e => setScroll(e.nativeEvent.contentOffset.y)}

// GOOD: Reanimated shared value (worklet thread)
const ref = useAnimatedRef()
const scroll = useScrollViewOffset(ref)
const style = useAnimatedStyle(() => ({
    opacity: interpolate(scroll.value, [0, 30], [0, 1], 'clamp')
}))
```

---

## 5. State Architecture (MEDIUM)

### Minimize State, Derive Values

```tsx
// BAD: redundant state
const [items, setItems] = useState([])
const [count, setCount] = useState(0)  // derived!

// GOOD: derive
const count = items.length
```

### Use Dispatch Updaters

```tsx
// BAD: stale closure risk
setCount(count + 1)

// GOOD: always current
setCount(prev => prev + 1)
```

### State Must Represent Ground Truth
- Don't store derived data in state.
- Single source of truth per piece of data.
- `useMemo` for expensive derivations.

---

## 6. UI Best Practices (MEDIUM)

### Modern Styling

- `boxShadow` style prop (not legacy shadow/elevation).
- `borderCurve: 'continuous'` for rounded corners.
- `fontVariant: ['tabular-nums']` for aligned counters.
- `gap` over margin for consistent spacing.
- Inline styles over `StyleSheet.create` unless reusing.

### Safe Areas

```tsx
<ScrollView contentInsetAdjustmentBehavior="automatic" />
// NOT <SafeAreaView> (legacy)
```

### Dimensions

```tsx
// BAD
Dimensions.get('window').width

// GOOD: reactive to changes
const { width } = useWindowDimensions()
```

### Images

- Use `expo-image` instead of RN `Image`.
- Use `expo-image` with `source="sf:name"` for SF Symbols.
- Use `contentFit='cover'` for proper aspect ratio.

### Pressables

```tsx
// BAD: legacy
<TouchableOpacity />

// GOOD: modern
<Pressable />
```

---

## 7. React Compiler Notes

When React Compiler is enabled:
- `memo()` and `useCallback()` are less critical (auto-memoized).
- Object reference stability in lists still matters.
- Use `.get()` and `.set()` for Reanimated shared values (not `.value`).
- Destructure functions early in render body.

---

## Skill Sources

- `vercel-react-native-skills/AGENTS.md` (35+ rules, 13 categories)
- `expo-skill/references/building-native-ui.md` (UI best practices)
