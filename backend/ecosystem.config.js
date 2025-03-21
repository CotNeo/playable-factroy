module.exports = {
  apps: [
    {
      name: "todo-app",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5001
      }
    }
  ]
}; 