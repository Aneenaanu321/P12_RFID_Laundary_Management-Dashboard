"use client";

import { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type ActionToastButtonProps = Omit<ButtonProps, "onClick" | "type"> & {
  formAction: (formData: FormData) => void | Promise<void>;
  successTitle: string;
  successMessage?: string;
  children: ReactNode;
};

/** Submit button that runs a server action then shows a success toast. */
export function ActionToastButton({
  formAction,
  successTitle,
  successMessage,
  children,
  ...buttonProps
}: ActionToastButtonProps) {
  const { toast } = useToast();

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        toast({ title: successTitle, message: successMessage, tone: "success" });
      }}
    >
      <Button type="submit" {...buttonProps}>
        {children}
      </Button>
    </form>
  );
}
