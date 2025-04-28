"use client";

import { useToast } from "@/hooks/use-toast";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

const DeleteDialog = ({
  id,
  action,
  many = false,
  actionMany,
  text = "Delete",
  additionalAlertText = "",
}: {
  id?: string;
  action?: (id: string) => Promise<{ success: boolean; message: string }>;
  many?: boolean;
  actionMany?: () => Promise<{ success: boolean; message: string }>;
  text?: string;
  additionalAlertText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDeleteManyClick = () => {
    startTransition(async () => {
      if (!actionMany || !many) {
        toast({
          variant: "destructive",
          description: "Action is not defined.",
        });
        return;
      }
      const res = await actionMany();

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      } else {
        setOpen(false);
        toast({
          description: res.message,
        });
      }
    });
  };

  const handleDeleteClick = () => {
    startTransition(async () => {
      if (!action || !id) {
        toast({
          variant: "destructive",
          description: "Action is not defined.",
        });
        return;
      }
      const res = await action(id);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      } else {
        setOpen(false);
        toast({
          description: res.message,
        });
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          size={"sm"}
          variant={"destructive"}
        >
          {text}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure</AlertDialogTitle>
          <AlertDialogDescription>
            This action can not be undone <br />
            {additionalAlertText || ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            size={"sm"}
            disabled={isPending}
            onClick={!many ? handleDeleteClick : handleDeleteManyClick}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
