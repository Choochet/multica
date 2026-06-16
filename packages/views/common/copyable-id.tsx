"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@multica/ui/components/ui/tooltip";
import { useT } from "../i18n";

export function CopyableId({ id }: { id: string }) {
  const { t } = useT("ui");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <span className="truncate font-mono text-[11px] text-muted-foreground">{id}</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied
                ? <Check className="size-3" />
                : <Copy className="size-3" />}
            </button>
          }
        />
        <TooltipContent side="top">
          {copied ? t(($) => $.id_copied) : t(($) => $.copy_id_tooltip)}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
