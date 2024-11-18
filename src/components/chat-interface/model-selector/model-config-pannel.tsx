import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomModelConfig, ModelConfigurationParams } from "@/types";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ALL_MODEL_NAMES } from "@/constants";
import { cn } from "@/lib/utils";
import { GearIcon, ResetIcon } from "@radix-ui/react-icons";
import { useCallback } from "react";

interface ModelConfigPanelProps {
  model: ModelConfigurationParams;
  modelConfig: CustomModelConfig;
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (e: any) => any;
  setModelConfig: (
    modelName: ALL_MODEL_NAMES,
    config: CustomModelConfig
  ) => void;
}

export function ModelConfigPanel({
  model,
  modelConfig,
  className,
  isOpen,
  onOpenChange,
  onClick,
  setModelConfig,
}: ModelConfigPanelProps) {
  console.log("modelConfig ", modelConfig);

  const handleTemperatureChange = useCallback(
    (value: number[]) => {
      setModelConfig(model.name, {
        ...modelConfig,
        temperatureRange: {
          ...modelConfig.temperatureRange,
          current: value[0],
        },
      });
    },
    [setModelConfig, modelConfig, model]
  );

  const handleMaxTokensChange = useCallback(
    (value: number[]) => {
      setModelConfig(model.name, {
        ...modelConfig,
        maxTokens: {
          ...modelConfig.maxTokens,
          current: value[0],
        },
      });
    },
    [setModelConfig, modelConfig, model]
  );

  const handleReset = useCallback(() => {
    setModelConfig(model.name, {
      ...modelConfig,
      temperatureRange: {
        ...modelConfig.temperatureRange,
        current: modelConfig.temperatureRange.default,
      },
      maxTokens: {
        ...modelConfig.maxTokens,
        current: modelConfig.maxTokens.default,
      },
    });
  }, [setModelConfig, modelConfig, model]);

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger onClick={onClick} asChild>
        <button className="flex-shrink-0 flex size-6 items-center justify-center focus:outline-none focus:ring-0 focus:ring-offset-0">
          <GearIcon className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className={cn("w-80 p-6 rounded-xl shadow-lg", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid gap-4">
          <ModelSettingSlider
            title="Temperature"
            description="Controls creativity - lower for focused outputs, higher for more variety and imagination."
            value={modelConfig.temperatureRange.current}
            range={{
              min: modelConfig.temperatureRange.min,
              max: modelConfig.temperatureRange.max,
              step: 0.1,
            }}
            onChange={handleTemperatureChange}
          />
          <ModelSettingSlider
            title="Max tokens"
            description="Set how long the AI's response can be - more tokens mean longer, more detailed responses."
            value={modelConfig.maxTokens.current}
            range={{
              min: modelConfig.maxTokens.min,
              max: modelConfig.maxTokens.max,
              step: 1,
            }}
            onChange={handleMaxTokensChange}
          />
          <Button onClick={handleReset} variant="outline" className="mt-2">
            <ResetIcon className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const ModelSettingSlider = ({
  title,
  description,
  value,
  range,
  onChange,
}: {
  title: string;
  description: string;
  value: number;
  range: { min: number; max: number; step: number };
  onChange: (value: number[]) => void;
}) => (
  <div className="space-y-2">
    <h4 className="font-semibold leading-none text-base">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
    <Slider
      min={range.min}
      max={range.max}
      step={range.step}
      value={[value]}
      onValueChange={onChange}
    />
    <div className="text-right text-sm">{value}</div>
  </div>
);