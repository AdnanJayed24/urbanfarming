# Benchmark Report

## Included Performance Support

This backend exposes two ways to inspect API timing:

- Runtime route metrics at `GET /api/v1/metrics/benchmark`
- A simple request timing script at `npm run benchmark:run`

## Suggested Benchmark Flow

1. Start the API with `npm run dev`
2. Warm up the database connection by hitting `GET /health`
3. Run `npm run benchmark:run`
4. Inspect the live route report at `GET /api/v1/metrics/benchmark`

## Target Endpoints

- `GET /health`
- `GET /api/docs/openapi.json`
- `GET /api/v1/produce`
- `GET /api/v1/rentals`
- `GET /api/v1/community/posts`

## Output Format

The script prints:

- Per-endpoint HTTP status
- Per-endpoint response duration in milliseconds
- Average duration across the benchmark set

The live benchmark endpoint returns:

- Request count per route
- Average, minimum, and maximum response times
- Most recent status code seen for each route
