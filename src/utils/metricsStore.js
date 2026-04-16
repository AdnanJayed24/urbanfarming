const routeMetrics = new Map();

function recordMetric(key, durationMs, statusCode) {
  if (!routeMetrics.has(key)) {
    routeMetrics.set(key, {
      count: 0,
      totalMs: 0,
      minMs: Number.POSITIVE_INFINITY,
      maxMs: 0,
      lastStatusCode: statusCode
    });
  }

  const item = routeMetrics.get(key);
  item.count += 1;
  item.totalMs += durationMs;
  item.minMs = Math.min(item.minMs, durationMs);
  item.maxMs = Math.max(item.maxMs, durationMs);
  item.lastStatusCode = statusCode;
}

function getBenchmarkReport(startedAt) {
  return {
    generatedAt: new Date().toISOString(),
    serverStartedAt: startedAt.toISOString(),
    routes: Array.from(routeMetrics.entries())
      .map(([route, metric]) => ({
        route,
        requests: metric.count,
        averageMs: Number((metric.totalMs / metric.count).toFixed(2)),
        minMs: Number(metric.minMs.toFixed(2)),
        maxMs: Number(metric.maxMs.toFixed(2)),
        lastStatusCode: metric.lastStatusCode
      }))
      .sort((left, right) => right.averageMs - left.averageMs)
  };
}

module.exports = {
  recordMetric,
  getBenchmarkReport
};
