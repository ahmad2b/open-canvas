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
  const store = ensureStoreInConfig(config);
  console.log("Thread Titler store: ", store);

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.5,
  });

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

  const formattedSystemPrompt = GENERATE_THREAD_TITLE_PROMPT.replace(
    "{firstMessage}",
    firstMessage
  )
    .replace("artifact", artifactContent ?? "No artifact found.")
    .replace("response", aiResponse);

  const result = await model.invoke([
    { role: "system", content: formattedSystemPrompt },
  ]);

  console.log(result);

  return {};
};

const builder = new StateGraph(ThreadTitlerGraphAnnotation)
  .addNode("generateThreadTitle", threadTitler)
  .addEdge(START, "generateThreadTitle");

export const graph = builder.compile().withConfig({ runName: "threadTitler" });
