import type { Metadata } from "next";
import { buildPortfolioMetadata, PortfolioPage } from "@/app/page";

export async function generateMetadata(): Promise<Metadata> {
  return buildPortfolioMetadata("fr");
}

export default async function FrenchHomePage() {
  return <PortfolioPage locale="fr" />;
}
