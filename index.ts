import React, { useEffect, useMemo, useRef, useState } from "react";

export function createContext(defaultValue) {
  const id = crypto.randomUUID();

  return {
    id,
    Provider: ({ value, children, name = "provider" }) => {
      const topic = useMemo(() => crypto.randomUUID(), []);

      /** provider notification */
      useEffect(() => {
        const event = new CustomEvent("context_provider", {
          detail: {
            topic,
            id,
          },
        });

        window.dispatchEvent(event);
      }, []);

      /** change notification */
      useEffect(() => {
        const event = new CustomEvent(topic, { detail: value });
        window.dispatchEvent(event);
      }, [value]);

      return children;
    },
    Consumer: () => {
      /** @todo */
    },
    defaultValue
  };
}

export function useContext(context: React.Context<any>) {
  const topic = useRef<string>(null);
  const [value, setValue] = useState();

  /** listening for provider topic */
  useEffect(() => {
    const onTopic = (event) => {
      setValue(event.detail);
    };

    const onProvider = (event) => {
      if (!topic.current && event.detail.id === context.id) {
        topic.current = event.detail.topic;
        window.addEventListener(topic.current, onTopic);
      }
    };

    window.addEventListener("context_provider", onProvider);

    return () => {
      window.removeEventListener("context_provider", onProvider);
      window.removeEventListener(topic.current, onProvider);
    };
  }, []);

  return value ?? context.defaultValue;
}
