module.exports = {
  apps: [
    {
      name: 'mdiq',
      script: 'npm',
      args: 'start',
      interpreter: '/home2/cartoma/.nvm/versions/node/v18.17.0/bin/node',
      cwd: '/home2/cartoma/mdiq',
      autorestart: true,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      node_args: '--max-old-space-size=4096'
    }
  ]
};
