import {
  AgentUIProvider,
  Screen,
  Scroll,
  Text,
  VStack,
  HStack,
  agentUIBouncy,
  agentUIEaseInOut,
  agentUIGentle,
  agentUISnappy,
  agentUISpring,
  agentUIOpacityTransition,
  agentUISlideTransition,
  agentUIScaleTransition,
  agentUILayoutTransitionSmooth,
  getAgentUIPackageManifest
} from "@expo-agent-ui/core";
import { StyleSheet } from "react-native";

function PresetRow({
  label,
  config
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
}) {
  return (
    <VStack spacing={4}>
      <Text variant="caption">{label}</Text>
      <Text>{JSON.stringify(config, null, 2)}</Text>
    </VStack>
  );
}

export default function MotionDemoScreen() {
  const manifest = getAgentUIPackageManifest();

  return (
    <AgentUIProvider>
      <Screen
        id="motion.demo"
        name="motion-demo"
        style={styles.screen}
        title="Motion Layer"
      >
        <Scroll
          accessibilityLabel="Motion layer demo"
          contentSpacing={16}
          id="motion.demo.scroll"
          contentContainerStyle={styles.content}
        >
          <Text id="motion.demo.title" variant="title">
            Motion Layer — Stage 6
          </Text>
          <Text id="motion.demo.description">
            Taste-preset config factories for Reanimated 4. Consumers wire these
            presets into withSpring, withTiming, entering/exiting builders, and
            layout transitions.
          </Text>

          <HStack spacing={8}>
            <Text variant="caption">Capabilities:</Text>
            <Text>{manifest.implementedCapabilities.join(", ")}</Text>
          </HStack>

          <Text id="motion.demo.spring.heading" variant="headline">
            Spring Presets
          </Text>
          <PresetRow label="agentUISpring()" config={agentUISpring() as unknown as Record<string, unknown>} />
          <PresetRow label="agentUIBouncy()" config={agentUIBouncy() as unknown as Record<string, unknown>} />
          <PresetRow label="agentUISnappy()" config={agentUISnappy() as unknown as Record<string, unknown>} />

          <Text id="motion.demo.timing.heading" variant="headline">
            Timing Presets
          </Text>
          <PresetRow
            label="agentUIEaseInOut()"
            config={agentUIEaseInOut() as unknown as Record<string, unknown>}
          />
          <PresetRow
            label="agentUIGentle()"
            config={agentUIGentle() as unknown as Record<string, unknown>}
          />

          <Text id="motion.demo.transitions.heading" variant="headline">
            Transition Presets
          </Text>
          <PresetRow
            label="agentUIOpacityTransition()"
            config={agentUIOpacityTransition() as unknown as Record<string, unknown>}
          />
          <PresetRow
            label="agentUISlideTransition()"
            config={agentUISlideTransition() as unknown as Record<string, unknown>}
          />
          <PresetRow
            label="agentUIScaleTransition()"
            config={agentUIScaleTransition() as unknown as Record<string, unknown>}
          />

          <Text id="motion.demo.layout.heading" variant="headline">
            Layout Transitions
          </Text>
          <PresetRow
            label="agentUILayoutTransitionSmooth()"
            config={agentUILayoutTransitionSmooth() as unknown as Record<string, unknown>}
          />
        </Scroll>
      </Screen>
    </AgentUIProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24
  },
  screen: {
    backgroundColor: "#F8FAFC"
  }
});
