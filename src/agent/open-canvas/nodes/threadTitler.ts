import { Client } from "@langchain/langgraph-sdk";
import { OpenCanvasGraphAnnotation } from "../state";

export const threadTitler = async (
  state: typeof OpenCanvasGraphAnnotation.State
  // config: LangGraphRunnableConfig
) => {
  const langgraphClient = new Client({
    apiUrl: `http://localhost:${process.env.PORT}`,
    defaultHeaders: {
      "X-API-KEY": process.env.LANGCHAIN_API_KEY,
    },
  });

  const threadTitlerInput = {
    messages: state.messages,
    artifact: state.artifact,
  };

  // const threadTitlerConfig = {
  //   configurable: {
  //     assistant_id: config.configurable?.assistant_id,
  //   },
  // };

  const newThread = await langgraphClient.threads.create();

  console.log("New Thread: ", newThread.status);

  await langgraphClient.runs.create(newThread.thread_id, "threadTitler", {
    input: threadTitlerInput,
    // config: threadTitlerConfig,
    multitaskStrategy: "enqueue",
    afterSeconds: 15,
  });

  return {};
};
