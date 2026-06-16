"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@multica/ui/lib/clipboard";
import { DropdownMenuItem } from "@multica/ui/components/ui/dropdown-menu";
import { useT } from "../i18n";

/**
 * Shared "Copy ID" dropdown menu item. Drops into any entity kebab (`...`)
 * menu so every entity exposes its raw UUID for API/CLI use with identical
 * label, icon, and toast. Copies the full id regardless of how it's displayed.
 */
export function CopyIdMenuItem({ id }: { id: string }) {
  const { t } = useT("ui");
  return (
    <DropdownMenuItem
      onClick={() => {
        void copyText(id).then((ok) => {
          if (ok) toast.success(t(($) => $.id_copied));
        });
      }}
    >
      <Copy className="h-3.5 w-3.5" />
      {t(($) => $.copy_id_action)}
    </DropdownMenuItem>
  );
}
