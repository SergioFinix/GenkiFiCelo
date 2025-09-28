export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://genki-fi-celo-web.vercel.app";

  const config = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    frame: {
      version: "1",
      name: "GenkiFi",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/opengraph-image.png`,
      buttonTitle: "Launch GenkiFi",
      splashImageUrl: `${appUrl}/icon.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}