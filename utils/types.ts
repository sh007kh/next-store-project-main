export type actionFunction = (
  prevState: { message: string },
  formData: FormData
) => Promise<{ message: string }>;

export type CartItem = {
  productId: string;
  image: string;
  title: string;
  price: string;
  amount: number;
  company: string;
};

export type CartState = {
  cartItems: CartItem[];
  numItemsInCart: number;
  cartTotal: number;
  shipping: number;
  tax: number;
  orderTotal: number;
};

import { Prisma } from "@prisma/client";

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { variant: { include: { product: { include: { images: true } } } } };
}>;
