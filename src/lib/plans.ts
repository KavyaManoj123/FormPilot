export const FREE_PLAN_FORM_LIMIT = 3;

export type UserPlan = "FREE" | "PRO";

export function getFormLimit(plan: UserPlan) {
  return plan === "PRO" ? null : FREE_PLAN_FORM_LIMIT;
}

export function canCreateMoreForms(plan: UserPlan, formsCount: number) {
  const limit = getFormLimit(plan);
  return limit === null || formsCount < limit;
}

export function getRemainingFormSlots(plan: UserPlan, formsCount: number) {
  const limit = getFormLimit(plan);

  if (limit === null) {
    return null;
  }

  return Math.max(0, limit - formsCount);
}
