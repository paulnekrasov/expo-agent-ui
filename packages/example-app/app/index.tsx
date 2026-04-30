import {
  AgentUIProvider,
  Button,
  Form,
  HStack,
  Icon,
  Image,
  Label,
  List,
  Picker,
  Screen,
  Scroll,
  SecureField,
  Spacer,
  Section,
  Slider,
  Stepper,
  Text,
  TextField,
  Toggle
} from "@agent-ui/core";
import { useState } from "react";
import { StyleSheet } from "react-native";

export default function IndexScreen() {
  const [runtimeEnabled, setRuntimeEnabled] = useState(false);
  const [confidence, setConfidence] = useState(75);
  const [sessionMode, setSessionMode] = useState<"local" | "cloud">("local");
  const [retryCount, setRetryCount] = useState(2);

  return (
    <AgentUIProvider>
      <Screen
        id="example.home"
        name="home"
        style={styles.screen}
        title="Expo Agent UI"
      >
        <Scroll
          accessibilityLabel="Expo Agent UI example settings"
          contentSpacing={16}
          id="example.home.scroll"
          contentContainerStyle={styles.content}
        >
          <Text id="example.home.title" variant="title">
            Expo Agent UI
          </Text>
          <Text
            accessibilityLabel="Example screen description"
            id="example.home.description"
          >
            React Native-first primitives with stable semantic identifiers.
          </Text>
          <Image
            accessibilityLabel="React Native logo"
            id="example.home.logo"
            source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
            style={styles.logo}
          />
          <List
            accessibilityLabel="Example settings list"
            id="example.home.settings"
            spacing={14}
          >
            <Section id="example.home.runtime" title="Runtime">
              <Form
                accessibilityLabel="Runtime connection form"
                id="example.home.runtime.form"
                spacing={10}
              >
                <Label icon="info" id="example.home.inputLabel">
                  Runtime connection
                </Label>
                <TextField
                  id="example.home.projectName"
                  label="Project name"
                  placeholder="Project name"
                  defaultValue="Expo Agent UI"
                />
                <SecureField
                  id="example.home.pairingToken"
                  label="Pairing token"
                  placeholder="Pairing token"
                />
                <HStack alignment="center" spacing={12}>
                  <Label id="example.home.runtime.toggleLabel">
                    Enable runtime bridge
                  </Label>
                  <Spacer />
                  <Toggle
                    accessibilityLabel="Enable runtime bridge"
                    id="example.home.runtime.enabled"
                    intent="example.toggleRuntimeBridge"
                    onValueChange={setRuntimeEnabled}
                    value={runtimeEnabled}
                  />
                </HStack>
                <Slider
                  accessibilityLabel="Automation confidence"
                  id="example.home.automation.confidence"
                  intent="example.setAutomationConfidence"
                  maximumValue={100}
                  minimumValue={0}
                  onValueChange={setConfidence}
                  step={5}
                  value={confidence}
                  valueFormatter={(nextValue) => `${nextValue}%`}
                />
                <Picker
                  accessibilityLabel="Session mode"
                  id="example.home.session.mode"
                  intent="example.selectSessionMode"
                  onValueChange={(nextValue) =>
                    setSessionMode(nextValue === "cloud" ? "cloud" : "local")
                  }
                  options={[
                    {
                      id: "local",
                      label: "Local session",
                      value: "local"
                    },
                    {
                      id: "cloud",
                      label: "Cloud preview",
                      value: "cloud"
                    }
                  ]}
                  selectedValue={sessionMode}
                />
                <Stepper
                  accessibilityLabel="Retry attempts"
                  id="example.home.retry.count"
                  intent="example.setRetryCount"
                  maximumValue={5}
                  minimumValue={0}
                  onValueChange={setRetryCount}
                  step={1}
                  value={retryCount}
                />
              </Form>
            </Section>
          </List>
          <HStack alignment="center" spacing={12}>
            <Icon decorative name="inspect" size={14} />
            <Button
              accessibilityLabel="Run primitive example"
              id="example.home.primaryAction"
              intent="example.runPrimitiveAction"
              onPress={() => undefined}
            >
              Inspect Primitives
            </Button>
            <Spacer />
          </HStack>
        </Scroll>
      </Screen>
    </AgentUIProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24
  },
  logo: {
    height: 48,
    width: 48
  },
  screen: {
    backgroundColor: "#F8FAFC"
  }
});
