import { getArtifactContent } from "@/hooks/use-graph/utils";
import { isArtifactMarkdownContent } from "@/lib/artifact_content_types";
import {
  START,
  StateGraph,
  type LangGraphRunnableConfig,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { ensureStoreInConfig } from "../utils";
import { GENERATE_THREAD_TITLE_PROMPT } from "./prompts";
import {
  ThreadTitlerGraphAnnotation,
  ThreadTitlerGraphAnnotationGraphReturnType,
} from "./state";

export const threadTitler = async (
  state: typeof ThreadTitlerGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<ThreadTitlerGraphAnnotationGraphReturnType> => {
  console.log("Starting threadTitler node");
  console.log("State: ", state);
  console.log("Config: ", config);

  const store = ensureStoreInConfig(config);
  console.log("Store initialized");

  const assistantId = config.configurable?.open_canvas_assistant_id;
  console.log("Assistant ID:", assistantId);

  if (!assistantId) {
    throw new Error("`open_canvas_assistant_id` not found in configurable");
  }

  const memoryNamespace = ["memories", assistantId];
  const memoryKey = "threadTitler";
  const memories = await store.get(memoryNamespace, memoryKey);
  console.log("Retrieved memories:", memories);

  const memoriesAsString = memories?.value
    ? memories.value
    : "No reflections found.";

  console.log("memoriesAsString: ", memoriesAsString);

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.5,
  });
  console.log("Model initialized");

  const currentArtifactContent = state.artifact
    ? getArtifactContent(state.artifact)
    : undefined;

  const artifactContent = currentArtifactContent
    ? isArtifactMarkdownContent(currentArtifactContent)
      ? currentArtifactContent.fullMarkdown
      : currentArtifactContent.code
    : undefined;

  const firstMessage = state.messages[0].content as string;
  const aiResponse = state.messages[1].content as string;
  console.log("First message:", firstMessage);
  console.log("AI response:", aiResponse);
  const formattedSystemPrompt = GENERATE_THREAD_TITLE_PROMPT.replace(
    "{firstMessage}",
    firstMessage
  )
    .replace("artifact", artifactContent ?? "No artifact found.")
    .replace("response", aiResponse);
  console.log("Formatted system prompt:", formattedSystemPrompt);

  const result = await model.invoke([
    { role: "system", content: formattedSystemPrompt },
  ]);
  console.log("Model result:", result);

  const newMemories = {
    thread_title: result.content,
  };
  console.log("New memories to store:", newMemories);

  await store.put(memoryNamespace, memoryKey, newMemories);

  console.log("New memories stored");

  return {};
};

const builder = new StateGraph(ThreadTitlerGraphAnnotation)
  .addNode("generateThreadTitle", threadTitler)
  .addEdge(START, "generateThreadTitle");

export const graph = builder.compile().withConfig({ runName: "threadTitler" });
