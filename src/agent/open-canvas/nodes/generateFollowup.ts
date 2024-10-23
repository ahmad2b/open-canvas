import { createModelInstance } from "@/agent/lib";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { ArtifactContent, Reflections } from "../../../types";
import { ensureStoreInConfig, formatReflections } from "../../utils";
import { FOLLOWUP_ARTIFACT_PROMPT } from "../prompts";
import { OpenCanvasGraphAnnotation, OpenCanvasGraphReturnType } from "../state";

/**
 * Generate a followup message after generating or updating an artifact.
 */
export const generateFollowup = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<OpenCanvasGraphReturnType> => {
  // const smallModel = new ChatOpenAI({
  //   model: "gpt-4o-mini",
  //   temperature: 0.5,
  //   maxTokens: 250,
  // });
  console.log("LOG generateFollowup state: ", state);
  console.log("LOG generating model instance with model: ", state.model);
  const model = createModelInstance(state.model ?? "gpt-4o-mini", {
    temperature: 0.5,
    maxTokens: 250,
  });
  console.log("LOG model generated: ");
  const smallModel = model;

  const store = ensureStoreInConfig(config);
  const assistantId = config.configurable?.assistant_id;
  if (!assistantId) {
    throw new Error("`assistant_id` not found in configurable");
  }
  const memoryNamespace = ["memories", assistantId];
  const memoryKey = "reflection";
  const memories = await store.get(memoryNamespace, memoryKey);
  const memoriesAsString = memories?.value
    ? formatReflections(memories.value as Reflections, {
        onlyContent: true,
      })
    : "No reflections found.";

  let currentArtifactContent: ArtifactContent | undefined;
  if (state.artifact) {
    currentArtifactContent = state.artifact.contents.find(
      (art) => art.index === state.artifact.currentContentIndex
    );
  }
  const formattedPrompt = FOLLOWUP_ARTIFACT_PROMPT.replace(
    "{artifactContent}",
    currentArtifactContent?.content ?? "No artifacts generated yet."
  )
    .replace("{reflections}", memoriesAsString)
    .replace(
      "{conversation}",
      state.messages
        .map(
          (msg) => `<${msg._getType()}>\n${msg.content}\n</${msg._getType()}>`
        )
        .join("\n\n")
    );

  // TODO: Include the chat history as well.
  const response = await smallModel.invoke([
    { role: "user", content: formattedPrompt },
  ]);

  if (state.lastNodeName === "generateArtifact") {
    // In order for the history to properly work on the frontend, we must
    // add the artifact ID to the followup message if it was just generated.
    response.response_metadata.artifactId = state.artifact.id;
  }

  return {
    messages: [response],
  };
};
