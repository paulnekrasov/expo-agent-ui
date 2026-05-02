import React, { useState } from "react";
import { Alert } from "react-native";
import {
  Screen,
  VStack,
  Section,
  Toggle,
  Picker,
  Slider,
  Button,
} from "@agent-ui/core";

const THEME_OPTIONS = [
  { id: "light",  label: "Light",  value: "light" },
  { id: "dark",   label: "Dark",   value: "dark" },
  { id: "system", label: "System", value: "system" },
];

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("system");
  const [textSize, setTextSize] = useState(16);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          Alert.alert("Signed Out", "You have been signed out.");
        },
      },
    ]);
  };

  return (
    <Screen id="settings" title="Settings">
      <VStack spacing={16} style={{ padding: 16 }}>
        <Section id="settings.general" title="General">
          <Toggle
            id="settings.general.notifications"
            label="Enable Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
          <Picker
            id="settings.general.theme"
            label="Theme"
            selectedValue={theme}
            options={THEME_OPTIONS}
            onValueChange={(value) => setTheme(String(value))}
          />
          <Slider
            id="settings.general.textsize"
            label="Text Size"
            value={textSize}
            minimumValue={12}
            maximumValue={28}
            step={1}
            onValueChange={setTextSize}
          />
        </Section>

        <Section id="settings.account" title="Account">
          <Button
            id="settings.account.signout"
            intent="destructive"
            onPress={handleSignOut}
          >
            Sign Out
          </Button>
        </Section>
      </VStack>
    </Screen>
  );
}
