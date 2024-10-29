import {
  type LangGraphRunnableConfig,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { getArtifactContent } from "../../hooks/use-graph/utils";
import { isArtifactMarkdownContent } from "../../lib/artifact_content_types";
import { TITLE_SYSTEM_PROMPT, TITLE_USER_PROMPT } from "./prompts";
import {
  TitleGenerationGraphAnnotation,
  TitleGenerationGraphReturnType,
} from "./state";

export const generateTitle = async (
  state: typeof TitleGenerationGraphAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<TitleGenerationGraphReturnType> => {
  const generateTitleTool = {
    name: "generate_title",
    description: "Generate a concise title for the thread.",
    schema: z.object({
      title: z.string().describe("The generated title for the thread."),
    }),
  };

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  }).bindTools([generateTitleTool], {
    tool_choice: "generate_title",
  });

  const firstMessage = state.messages[0].content as string;
  const response = state.messages[1].content as string;

  const currentArtifactContent = state.artifact
    ? getArtifactContent(state.artifact)
    : undefined;

  const artifactContent = currentArtifactContent
    ? isArtifactMarkdownContent(currentArtifactContent)
      ? currentArtifactContent.fullMarkdown
      : currentArtifactContent.code
    : undefined;

  const artifactSection = artifactContent
    ? `<artifact>\n${artifactContent}\n</artifact>`
    : "";

  const formattedUserPrompt = TITLE_USER_PROMPT.replace(
    "{first_message}",
    firstMessage
  )
    .replace("{response}", response)
    .replace("{artifact_section}", artifactSection);

  const result = await model.invoke([
    {
      role: "system",
      content: TITLE_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: formattedUserPrompt,
    },
  ]);

  const titleToolCall = result.tool_calls?.[0];
  if (!titleToolCall) {
    console.error("FAILED TO GENERATE TOOL CALL", result);
    throw new Error("Title generation tool call failed.");
  }

  // Update thread metadata with the generated title
  const langGraphClient = new Client({
    apiUrl: `http://localhost:${process.env.PORT}`,
    defaultHeaders: {
      "X-API-KEY": process.env.LANGCHAIN_API_KEY,
    },
  });

  if (config.configurable?.thread_id) {
    await langGraphClient.threads.update(config.configurable.thread_id, {
      metadata: {
        thread_title: titleToolCall.args.title,
      },
    });
  }

  return {};
};

const builder = new StateGraph(TitleGenerationGraphAnnotation)
  .addNode("generateTitle", generateTitle)
  .addEdge(START, "generateTitle");

export const graph = builder
  .compile()
  .withConfig({ runName: "title_generation" });
