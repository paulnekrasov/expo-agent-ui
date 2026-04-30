import {
  AgentUIProvider,
  Button,
  Form,
  HStack,
  Icon,
  Image,
  Label,
  List,
  Screen,
  Scroll,
  SecureField,
  Spacer,
  Section,
  Text,
  TextField
} from "@agent-ui/core";
import { StyleSheet } from "react-native";

export default function IndexScreen() {
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
