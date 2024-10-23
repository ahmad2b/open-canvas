"use client";

import { TbBoxModel } from "react-icons/tb";

import { AllModelNames, anthropicModels, openAIModels } from "@/agent/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseMessage } from "@langchain/core/messages";
import { Thread } from "@langchain/langgraph-sdk";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const allModels: AllModelNames[] = [...openAIModels, ...anthropicModels];

interface ModelSelectorProps {
  model: AllModelNames;
  setModel: React.Dispatch<React.SetStateAction<AllModelNames>>;
  messages: BaseMessage[];
  createThread: () => Promise<Thread>;
}

export default function ModelSelector({
  messages,
  model,
  setModel,
  createThread,
}: ModelSelectorProps) {
  const searchParams = useSearchParams();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      const modelFromParams = searchParams.get("model") as AllModelNames;
      if (modelFromParams && allModels.includes(modelFromParams)) {
        setModel(modelFromParams);
      }
      initialLoadRef.current = false;
    }
  }, [searchParams, setModel]);

  const handleModelChange = async (newModel: AllModelNames) => {
    if (messages.length > 0 && newModel !== model) {
      // Create a new thread with the new model
      await createThread();
      setModel(newModel);
    } else {
      // Update model within the thread without creating a new thread
      setModel(newModel);
    }
  };

  return (
    <Select value={model} onValueChange={handleModelChange}>
      <SelectTrigger className="min-w-[180px] w-fit bg-transparent shadow-none text-sm focus:outline-none cursor-pointer hover:bg-gray-100 rounded transition-colors border-none ">
        <SelectValue>
          <div className="flex items-center pr-2">
            <TbBoxModel className="size-4 mr-2" />
            {model}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allModels.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
