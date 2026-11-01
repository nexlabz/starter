"use client";

import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";

// Same-origin: no baseURL needed, so it works on every preview/production domain.
export const authClient = createAuthClient({
  plugins: [organizationClient(), polarClient()],
});
