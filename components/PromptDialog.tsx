// PromptDialog.tsx
import { PromptDialogProps } from "@/types";
import React, { useState, useEffect } from "react";
import Dialog from "react-native-dialog";
import { useTheme } from "@/contexts/ThemeContext";

const PromptDialog: React.FC<PromptDialogProps> = ({
  visible,
  question,
  setResponse,
  onClose,
  initialValue
}) => {
    const { colors } = useTheme();
  const [input, setInput] = useState(initialValue || "");

   useEffect(() => {
    if (visible) {
      setInput(initialValue || "");
    }
  }, [initialValue, visible]);

  const handleOk = () => {
    if (!input) return; // If input is empty, do nothing
    setResponse(input);
    onClose(input); // pass the value
    setInput("");
  };

  const handleCancel = () => {
    onClose(); // no value
    setInput("");
  };

  return (
    <Dialog.Container visible={visible}>
      <Dialog.Title>{question}</Dialog.Title>
      <Dialog.Input value={input} onChangeText={setInput} />
      <Dialog.Button label="Cancel" onPress={handleCancel} />
      <Dialog.Button
        label="OK"
        onPress={handleOk}
        color={!input ? colors.secondary2 : undefined}
      />
    </Dialog.Container>
  );
};

export default PromptDialog;
