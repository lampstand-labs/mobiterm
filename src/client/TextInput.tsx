import { useState, useRef, useEffect } from "react";

interface TextInputProps {
  onSend: (text: string) => void;
  fitTerminal: () => void;
}

export function TextInput({ onSend, fitTerminal }: TextInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    setTimeout(fitTerminal, 100);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
      fitTerminal();
    }
  }, [inputValue]);

  const handleSend = () => {
    onSend(inputValue + "\r");
    setInputValue("");
  };

  return (
    <textarea
      ref={textareaRef}
      className="text-input"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }}
      placeholder="Type or dictate and press Enter to send..."
      rows={1}
    />
  );
}
