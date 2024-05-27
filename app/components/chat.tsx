"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { useConversation } from "../contexts/ConversationContext";

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
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""), // default to return empty string
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const { conversationIndex } = useConversation();
  const [threads, setThreads] = useState<{ [key: number]: { messages: any[], threadId: string } }>({});
  const [isComposing, setIsComposing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [threads, conversationIndex]);

  useEffect(() => {
    if (!threads[conversationIndex]) {
      const createThread = async () => {
        const res = await fetch(`/api/assistants/threads`, {
          method: "POST",
        });
        const data = await res.json();
        setThreads(prevThreads => ({
          ...prevThreads,
          [conversationIndex]: { messages: [], threadId: data.threadId }
        }));
      };
      createThread();
    }
  }, [conversationIndex]);

  const sendMessage = async (text: string) => {
    const thread = threads[conversationIndex];
    const response = await fetch(
      `/api/assistants/threads/${thread.threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream, thread.threadId);
  };

  const submitActionResult = async (runId: string, toolCallOutputs: any) => {
    const thread = threads[conversationIndex];
    const response = await fetch(
      `/api/assistants/threads/${thread.threadId}/actions`,
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
    handleReadableStream(stream, thread.threadId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isComposing) {
        return;
      } else if (e.shiftKey) {
        e.preventDefault();
        setUserInput((prev) => prev + "\n");
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }
  };
  
  const handleSubmit = () => {
    if (!userInput.trim()) return;
    sendMessage(userInput);
    appendMessage("user", userInput);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  const handleTextCreated = (threadId: string) => {
    appendMessage("assistant", "", threadId);
  };

  const handleTextDelta = (delta: any, threadId: string) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value, threadId);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations, threadId);
    }
  };

  const handleImageFileDone = (image: any, threadId: string) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`, threadId);
  };

  const toolCallCreated = (toolCall: any, threadId: string) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "", threadId);
  };

  const toolCallDelta = (delta: any, threadId: string) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input, threadId);
  };

  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction,
    threadId: string
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
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

  const handleReadableStream = (stream: AssistantStream, threadId: string) => {
    stream.on("textCreated", () => handleTextCreated(threadId));
    stream.on("textDelta", (delta: any) => handleTextDelta(delta, threadId));
    stream.on("imageFileDone", (image: any) => handleImageFileDone(image, threadId));
    stream.on("toolCallCreated", (toolCall: any) => toolCallCreated(toolCall, threadId));
    stream.on("toolCallDelta", (delta: any) => toolCallDelta(delta, threadId));
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event, threadId);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

    const appendToLastMessage = (text: string, threadId: string) => {
      setThreads(prevThreads => {
        const threadKey = Object.keys(prevThreads).find(key => prevThreads[key].threadId === threadId) || conversationIndex;
        const updatedMessages = prevThreads[threadKey].messages.map((message, index) => 
          index === prevThreads[threadKey].messages.length - 1
            ? { ...message, text: message.text + text }
            : message
        );
        const updatedThreads = { ...prevThreads };
        updatedThreads[threadKey] = {
          ...prevThreads[threadKey],
          messages: updatedMessages
        };
        return updatedThreads;
      });
    };
    
    

    const appendMessage = (role: string, text: string, threadId?: string) => {
      setThreads(prevThreads => {
        const threadKey = threadId ? Object.keys(prevThreads).find(key => prevThreads[key].threadId === threadId) : conversationIndex;
        const updatedMessages = [...prevThreads[threadKey].messages, { role, text }];
        const updatedThreads = { ...prevThreads };
        updatedThreads[threadKey] = {
          ...prevThreads[threadKey],
          messages: updatedMessages
        };
        return updatedThreads;
      });
    };
    

  const annotateLastMessage = (annotations: any, threadId: string) => {
    setThreads(prevThreads => {
      const updatedMessages = [...prevThreads[conversationIndex].messages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      annotations.forEach((annotation: any) => {
        if (annotation.type === 'file_path') {
          lastMessage.text = lastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      updatedMessages[updatedMessages.length - 1] = lastMessage;
      return {
        ...prevThreads,
        [conversationIndex]: {
          ...prevThreads[conversationIndex],
          messages: updatedMessages
        }
      };
    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {threads[conversationIndex]?.messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
      <textarea
        className={styles.input}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder="Enter your question"
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          送信
        </button>
      </form>
    </div>
  );
};

export default Chat;

