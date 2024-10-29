import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { OpenCanvasGraphAnnotation } from "../state";

export const threadTitler = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
) => {
  // Only generate title for first message in a thread
  if (state.messages.length > 1) {
    return {};
  }

  const langGraphClient = new Client({
    apiUrl: `http://localhost:${process.env.PORT}`,
    defaultHeaders: {
      "X-API-KEY": process.env.LANGCHAIN_API_KEY,
    },
  });

  const titleInput = {
    messages: state.messages,
    artifact: state.artifact,
  };

  const newThread = await langGraphClient.threads.create();

  // Create a new title generation run as a background task
  await langGraphClient.runs.create(newThread.thread_id, "title_generation", {
    input: titleInput,
    config: {
      configurable: {
        thread_id: config.configurable?.thread_id,
      },
    },
    multitaskStrategy: "enqueue",
    // Run after a short delay to ensure all processing is complete
    afterSeconds: 5,
  });

  return {};
};
