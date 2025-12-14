import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "BrinkifySA",
		short_name: "BrinkifySA",
		description: "BrinkifySA",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		icons: [
			{
				src: "/images/cover.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/images/cover.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
