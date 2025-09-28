export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://genki-fi-celo-web.vercel.app";

  const config = {
    accountAssociation: {
    header: "eyJmaWQiOjEwNDM5ODcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwNzgzQTNhYzRDQzQ1NmRjOEEyNzMxNUYxMDNEYzREM0RBYjM4OUE3In0",
    payload: "eyJkb21haW4iOiJnZW5raS1maS1jZWxvLXdlYi52ZXJjZWwuYXBwIn0",
    signature: "MHg1ZmI5NmNiODhjYWM5NDIwNmQ1OTJkMjY3NGRkMDIxOGI2MWRmODYwOGU0YmI4MDY5Y2FlYTU4Y2JmZjAzYjk5MGVhNmYxNGU3OWNkY2MyNGRkYjI2NzAxZGExYTA0YTczYWQzOTNlMWEwN2E3YWRkNTFmY2ZlNGQ0Y2ZhMTZhYzFi"
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