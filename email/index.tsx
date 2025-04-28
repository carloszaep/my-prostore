import { Resend } from "resend";
import { APP_NAME, SENDER_EMAIL } from "@/lib/constants";
import { Order } from "@/types";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();
import PurchasesReceiptEmail from "./purcahse-receipt";
import ShippedOrderEmail from "./order-update";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceiptEmail = async ({ order }: { order: Order }) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Your order ${order.id} has been received`,
    react: <PurchasesReceiptEmail order={order} />,
  });
};

export const sendOrderUpdatedEmail = async ({ order }: { order: Order }) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Your order has been shipped`,
    react: <ShippedOrderEmail order={order} />,
  });
};
