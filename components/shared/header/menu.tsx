import { Button } from "@/components/ui/button";
// import ModeToggle from "./mode-toggle";
import { MoreVertical, ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UserButton from "./user-button";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Badge } from "@/components/ui/badge";

const Menu = async () => {
  const cart = await getMyCart();

  const cartNoEmpty = cart && cart?.items.length > 0;

  return (
    <div className="flex justify-end gap-3">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        {/* <ModeToggle /> */}
        <Button
          asChild
          variant={"ghost"}
        >
          <Link href="/cart">
            <ShoppingCart /> Cart{" "}
            {cartNoEmpty ? (
              <Badge
                variant={"secondary"}
                className="mb-2"
              >
                {cart.items.length}
              </Badge>
            ) : (
              ""
            )}
          </Link>
        </Button>
        <UserButton />
      </nav>
      <nav className="md:hidden flex justify-center items-center">
        <Button
          asChild
          variant={"ghost"}
          size={"lg"}
        >
          <Link href="/cart">
            <ShoppingCart />
            {cartNoEmpty ? (
              <Badge
                variant={"secondary"}
                className="mb-2"
              >
                {cart.items.length}
              </Badge>
            ) : (
              ""
            )}
          </Link>
        </Button>
        <Sheet>
          <SheetTrigger className="align-middle">
            <MoreVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            {/* <ModeToggle /> */}

            <UserButton />
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
