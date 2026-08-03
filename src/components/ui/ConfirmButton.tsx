"use client";

import { useState, ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToastOptional } from "@/components/ui/Toast";

type ConfirmButtonProps = Omit<ButtonProps, "onClick"> & {
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "warning" | "primary";
  formAction: (formData: FormData) => void | Promise<void>;
  successTitle?: string;
  successMessage?: string;
  children: ReactNode;
};

export function ConfirmButton({
  confirmTitle,
  confirmDescription,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  formAction,
  successTitle,
  successMessage,
  children,
  ...buttonProps
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const toastApi = useToastOptional();

  return (
    <>
      <Button type="button" {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        variant={confirmVariant}
        formAction={async (fd) => {
          await formAction(fd);
          if (successTitle) {
            toastApi?.toast({
              title: successTitle,
              message: successMessage,
              tone: confirmVariant === "danger" ? "warning" : "success",
            });
          }
        }}
      />
    </>
  );
}
