"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: any
  ) => Promise<string>; // Use 'any' if you do not have the exact type for 'RequiredActionFunctionToolCall'
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");

  const maxRetries = 3; // Maximum number of retries
  const retryDelay = 2000; // Delay between retries in milliseconds

  // Automatically scroll to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create a new threadID when the chat component is created
  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
      console.log(`New thread created with ID: ${data.threadId}`);
    };
    createThread();
  }, []);

  const sendMessage = async (text: string) => {
    try {
      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
          }),
        }
      );
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Error sending message:", error);
      await retrySendMessage(text);
    }
  };

const retrySendMessage = async (text: string, attempt = 1) => {
    if (attempt > maxRetries) {
        appendToLastMessage(
            `\nFailed to process after ${maxRetries} attempts. Please try again later.\n`
        );
        setInputDisabled(false);
        return;
    }

    appendToLastMessage(`\nAn error occurred. Retrying attempt ${attempt}/${maxRetries}...\n`);

    await new Promise((resolve) => setTimeout(resolve, retryDelay));

    try {
        await sendMessage(text);
    } catch (error) {
        console.error(`Retry attempt ${attempt} failed:`, error);
        // If the error is the same as before, don't retry endlessly
        if (error.message.includes("Final run has not been received")) {
            appendToLastMessage("\nIt seems the server is having trouble processing your request. Please try again later.\n");
            setInputDisabled(false);
            return;
        }
        retrySendMessage(text, attempt + 1);
    }
};


  const submitActionResult = async (runId: string, toolCallOutputs: any) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    scrollToBottom();
    sendMessage(userInput).finally(() => setInputDisabled(false));
  };

  /* Stream Event Handlers */

  const handleTextCreated = () => {
    appendMessage("assistant", "Analyzing...");
  };

  const handleTextDelta = (delta: { value?: string; annotations?: any }) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  const handleImageFileDone = (image: { file_id: string }) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  };

  const toolCallCreated = (toolCall: any) => {
    if (toolCall.type !== "code_interpreter") return;
    appendMessage("code", "");
  };

  const toolCallDelta = (delta: any, snapshot: any) => {
    if (delta.type !== "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  const handleRequiresAction = async (
    event: any
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall: any) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    let currentMessage = "";
    let messageContainsCode = false;

    appendMessage("assistant", "Analyzing...");

    stream.on("textDelta", (delta) => {
      if (delta.value != null) {
        currentMessage += delta.value;
        appendToLastMessage(delta.value);
        if (checkForCodeBlock(delta.value)) {
          messageContainsCode = true;
        }
      }
      if (delta.annotations != null) {
        annotateLastMessage(delta.annotations);
      }
    });

    stream.on("imageFileDone", (image) => {
      currentMessage += `\n![${image.file_id}](/api/files/${image.file_id})\n`;
    });

    stream.on("event", (event) => {
      if (event.event === "thread.run.completed") {
        replaceLastMessage("assistant", currentMessage);
      }
    });

    stream.on("error", async (err) => {
      console.error("Stream error:", err);
      await retrySendMessage(currentMessage, 1);
    });
  };

  const checkForCodeBlock = (text: string): boolean => {
    const codeKeywords = [
      "function",
      "const",
      "let",
      "import",
      "export",
      "class",
      "return",
      "if",
      "else",
      "for",
      "while",
    ];
    const lines = text.split("\n");
    return (
      lines.length > 3 || codeKeywords.some((keyword) => text.includes(keyword))
    );
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role: string, text: string) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const replaceLastMessage = (role: string, text: string) => {
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.slice(0, -1);
      updatedMessages.push({ role, text });
      return updatedMessages;
    });
  };

  const annotateLastMessage = (annotations: any) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation: any) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value.slice(0, 300))} // Limit input to 300 characters
          placeholder="Enter your question (max 300 characters)"
          disabled={inputDisabled}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
