import React, { useState } from "react";
import { Alert } from "react-native";
import {
  AgentUIProvider,
  Screen,
  VStack,
  Section,
  TextField,
  SecureField,
  Button,
} from "@expo-agent-ui/core";

export default function CheckoutScreen() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = () => {
    Alert.alert("Order Submitted", `Thank you, ${name}!`);
  };

  return (
    <Screen id="checkout" title="Checkout">
      <VStack spacing={16} style={{ padding: 16 }}>
        <Section id="checkout.shipping" title="Shipping">
          <TextField
            id="checkout.shipping.name"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
          <TextField
            id="checkout.shipping.address"
            label="Address"
            placeholder="123 Main Street"
            value={address}
            onChangeText={setAddress}
          />
          <TextField
            id="checkout.shipping.city"
            label="City"
            placeholder="San Francisco"
            value={city}
            onChangeText={setCity}
          />
          <TextField
            id="checkout.shipping.zip"
            label="ZIP Code"
            placeholder="94102"
            keyboardType="numeric"
            value={zip}
            onChangeText={setZip}
          />
        </Section>

        <Section id="checkout.payment" title="Payment">
          <SecureField
            id="checkout.payment.cardnumber"
            label="Card Number"
            placeholder="0000 0000 0000 0000"
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={setCardNumber}
          />
          <TextField
            id="checkout.payment.expiry"
            label="Expiry (MM/YY)"
            placeholder="12/28"
            keyboardType="numeric"
            value={expiry}
            onChangeText={setExpiry}
          />
          <SecureField
            id="checkout.payment.cvv"
            label="CVV"
            placeholder="123"
            keyboardType="numeric"
            value={cvv}
            onChangeText={setCvv}
          />
        </Section>

        <Button
          id="checkout.confirm"
          intent="submit_order"
          onPress={handleSubmit}
        >
          Confirm Order
        </Button>
      </VStack>
    </Screen>
  );
}

export function CheckoutScreenWithProvider() {
  return (
    <AgentUIProvider>
      <CheckoutScreen />
    </AgentUIProvider>
  );
}
