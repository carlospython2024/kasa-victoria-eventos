import { createContext, useContext } from "react";
import { wedding } from "../config";
import type { PublicInvitation } from "./types";
export const InvitationContext = createContext<{
  wedding: typeof wedding;
  live?: PublicInvitation;
  slug?: string;
}>({ wedding });
export const useInvitation = () => useContext(InvitationContext);
