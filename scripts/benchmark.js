const baseUrl = process.env.BENCHMARK_BASE_URL || "http://localhost:4000";

const endpoints = [
  { label: "health", method: "GET", path: "/health" },
  { label: "docs", method: "GET", path: "/api/docs/openapi.json" },
  { label: "produce-list", method: "GET", path: "/api/v1/produce" },
  { label: "rentals-list", method: "GET", path: "/api/v1/rentals" },
  { label: "community-posts", method: "GET", path: "/api/v1/community/posts" }
];

async function measureRequest(endpoint) {
  const startedAt = process.hrtime.bigint();
  const response = await fetch(`${baseUrl}${endpoint.path}`, { method: endpoint.method });
  const completedAt = process.hrtime.bigint();
  const durationMs = Number(completedAt - startedAt) / 1000000;

  return {
    endpoint: endpoint.label,
    method: endpoint.method,
    path: endpoint.path,
    status: response.status,
    durationMs: Number(durationMs.toFixed(2))
  };
}

async function main() {
  const results = [];

  for (const endpoint of endpoints) {
    results.push(await measureRequest(endpoint));
  }

  const total = results.reduce((sum, item) => sum + item.durationMs, 0);
  const averageMs = Number((total / results.length).toFixed(2));

  console.table(results);
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, averageMs, results }, null, 2));
}

main().catch((error) => {
  console.error("Benchmark run failed.");
  console.error(error);
  process.exit(1);
});
