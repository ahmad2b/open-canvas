import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { ArtifactV3 } from "../../types";

export const TitleGenerationGraphAnnotation = Annotation.Root({
  /**
   * The chat history to generate a title for.
   */
  ...MessagesAnnotation.spec,
  /**
   * The artifact that was generated (if any).
   */
  artifact: Annotation<ArtifactV3 | undefined>,
});

export type TitleGenerationGraphReturnType = Partial<
  typeof TitleGenerationGraphAnnotation.State
>;
