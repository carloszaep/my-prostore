"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  getOrderById,
  insertTrackingNumber,
} from "@/lib/actions/order-actions";

import { insertTrackingNumberSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const MarkAsShipped = ({ orderId }: { orderId: string }) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertTrackingNumberSchema>>({
    resolver: zodResolver(insertTrackingNumberSchema),
  });

  // Open Form Handler
  const handleOpenForm = async () => {
    form.setValue("id", orderId);

    const order = await getOrderById(orderId);

    if (order) {
      form.setValue("id", order.id);
      form.setValue("trackingNumber", order.trackingNumber || "");
    }

    setOpen(true);
  };

  // Submit Form Handler
  const onSubmit: SubmitHandler<
    z.infer<typeof insertTrackingNumberSchema>
  > = async (values) => {
    const res = await insertTrackingNumber({
      orderId,
      trackingNumber: values.trackingNumber,
    });

    if (!res.success) {
      return toast({
        variant: "destructive",
        description: res.message,
      });
    }

    setOpen(false);

    toast({
      description: res.message,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <Button
        onClick={handleOpenForm}
        type="button"
      >
        Marck As Shipped
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            method="post"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>Marck As Shipped</DialogTitle>
              <DialogDescription>
                Enter the tracking number for this order.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* HIDDEN ORDER ID */}
              <input
                type="hidden"
                {...form.register("id")}
              />
              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Tracking Number</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter tracking number"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAsShipped;
