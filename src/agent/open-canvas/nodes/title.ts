import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { OpenCanvasGraphAnnotation } from "../state";

export const titleNode = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
) => {
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
  const titleConfig = {
    configurable: {
      open_canvas_thread_id: config.configurable?.thread_id,
    },
  };

  // Create a new thread for title generation
  const newThread = await langGraphClient.threads.create();

  // Create a new title generation run in the background
  await langGraphClient.runs.create(newThread.thread_id, "title", {
    input: titleInput,
    config: titleConfig,
    multitaskStrategy: "enqueue",
    // Run immediately after the first message
    afterSeconds: 0,
  });

  return {};
};
