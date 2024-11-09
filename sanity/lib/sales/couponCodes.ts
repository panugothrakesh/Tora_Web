export const COUPON_CODES = {
    BLKFRD60: "BLKFRD60",
    NY2025: "NY2025"
} as const;

export type CouponCode = keyof typeof COUPON_CODES;