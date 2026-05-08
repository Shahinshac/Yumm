export default function handler(request: any, response: any) {
  response.status(200).json({
    message: "NexFood API v1 - Online",
    timestamp: new Date().toISOString(),
    endpoints: ["/api/orders", "/api/restaurants"]
  });
}
