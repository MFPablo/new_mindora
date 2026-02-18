import { z } from "zod";

export const promoKeyTypes = [
  "FREE_15_DAYS",
  "DISCOUNT_20",
  "DISCOUNT_50",
  "FREE_MONTH",
] as const;

export type PromoKeyType = (typeof promoKeyTypes)[number];

export const redeemPromoKeySchema = z.object({
  key: z.string().min(1, "El código es obligatorio.").trim(),
});

export type RedeemPromoKeyInput = z.infer<typeof redeemPromoKeySchema>;

export type PromoKeyRedemptionResponse = {
  success: boolean;
  message: string;
  promoType?: PromoKeyType;
};
