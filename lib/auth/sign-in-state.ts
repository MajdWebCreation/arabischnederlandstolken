// Kept separate from lib/auth/actions.ts: a "use server" file may only
// export async functions, so the shared state type and its initial value
// (a plain object, not a function) live here instead - the same split
// already used for the public contact form (lib/contact/types.ts vs
// app/[locale]/contact/actions.ts).
export type SignInState = {
  status: "idle" | "error";
  message: string;
};

export const initialSignInState: SignInState = { status: "idle", message: "" };
