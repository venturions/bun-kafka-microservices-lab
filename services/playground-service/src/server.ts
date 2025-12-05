const server = Bun.serve({
  port: 3001,
  fetch(request) {
    if (new URL(request.url).pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Playground service rodando em http://localhost:${server.port}`);
