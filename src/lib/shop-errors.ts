/** Backend FeatureValidationService khi tenant đã đủ MAX_SHOPS */
export function isShopLimitReachedError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("allows a maximum of") ||
    m.includes("maximum of") && m.includes("shop")
  );
}
