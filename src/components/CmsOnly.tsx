import type { ReactNode } from "react";
import CmsLocalOnlyPage from "../pages/admin/CmsLocalOnlyPage";

export const cmsIsLocal =
  import.meta.env.DEV || import.meta.env.VITE_CMS_LOCAL === "true";

export default function CmsOnly({ children }: { children: ReactNode }) {
  return cmsIsLocal ? children : <CmsLocalOnlyPage />;
}

