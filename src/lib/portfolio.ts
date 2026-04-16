import { getPortfolioContent as getStoredPortfolioContent } from "@/lib/cms/content-store";
import type { PortfolioContent } from "@/lib/types";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  return getStoredPortfolioContent();
}
