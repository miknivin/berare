// Withdrawal eligibility threshold, in points. The database's
// validate_withdrawal_request() trigger (migration 0003) independently
// enforces app_config.min_withdrawal_amount as the real safety net — this
// env var only drives the affiliate app's UI gating and gives a friendlier
// error before that trigger would ever fire.
export const MIN_WITHDRAWAL_POINTS = Number(process.env.MIN_WITHDRAWAL_POINTS) || 2000
