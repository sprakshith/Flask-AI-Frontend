import "./RceComponent.css";
import "react-chat-elements/dist/main.css";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { MessageBox, Input } from "react-chat-elements";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coyWithoutShadows } from "react-syntax-highlighter/dist/esm/styles/prism";

function RceComponent() {
  const [showInputField, setShowInputField] = useState(true);
  const [isInputFocused, setInputFocused] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleKeyDown = async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && isInputFocused) {
      const newMessage = {
        position: "right",
        title: "User",
        type: "text",
        text: event.target.value,
      };

      setMessages((currentMessages) => [...currentMessages, newMessage]);

      if (event.target.value === "/clear") {
        setMessages([]);
      } else {
        setShowInputField(false);

        try {
          const response = await fetch("http://127.0.0.1:5000/chat-agent-interation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: event.target.value }),
          });

          const data = await response.json();

          const agentMessage = {
            position: "left",
            title: "Agent",
            type: "text",
            text: data.response, // Assuming the response has a 'response' field
          };

          setMessages((currentMessages) => [...currentMessages, agentMessage]);

          setShowInputField(true);
        } catch (error) {
          console.error("Error:", error);
        }
      }

      event.target.value = "";
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInputFocused, messages]);

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter style={coyWithoutShadows} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="chat-box">
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBox key={index} {...message} text={<ReactMarkdown components={components}>{message.text}</ReactMarkdown>} />
        ))}
      </div>
      {showInputField && (
        <>
          <Input placeholder="Type here..." multiline={true} onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)} />
          <small className="send-instruction">Ctrl+Enter to send</small>
        </>
      )}
    </div>
  );
}

export default RceComponent;
