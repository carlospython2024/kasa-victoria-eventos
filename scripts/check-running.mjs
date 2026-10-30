try {
  const response = await fetch("http://127.0.0.1:5173/api/health", {
    signal: AbortSignal.timeout(1500),
  });
  const data = await response.json();
  process.exit(response.ok && data.ok === true ? 0 : 1);
} catch {
  process.exit(1);
}
