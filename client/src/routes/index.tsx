import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { VisualContent } from "@/components/home/VisualContent";
import { TrustSection } from "@/components/home/TrustSection";
import { CtaSection } from "@/components/home/CtaSection";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<div className="relative flex min-h-screen w-full flex-col group/design-root font-display">
			<Navbar />
			<main className="flex-grow">
				<Hero />
				<Features />
				<VisualContent />
				<TrustSection />
				<CtaSection />
			</main>
			<Footer />
		</div>
	);
}

export default Index;
