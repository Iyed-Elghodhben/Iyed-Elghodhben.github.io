import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // WSL mounts of /mnt/c don't propagate native fs change events, so
    // HMR silently misses edits unless the watcher polls instead.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
