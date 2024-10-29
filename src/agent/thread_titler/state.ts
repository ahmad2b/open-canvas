import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { ArtifactV3 } from "../../types";

export const ThreadTitlerGraphAnnotation = Annotation.Root({
  /**
   * The chat history to reflect on.
   */
  ...MessagesAnnotation.spec,
  /**
   * The artifact for generating title.
   */
  artifact: Annotation<ArtifactV3 | undefined>,
});

export type ThreadTitlerGraphAnnotationGraphReturnType = Partial<
  typeof ThreadTitlerGraphAnnotation.State
>;
