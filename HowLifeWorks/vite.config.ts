import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
    allowedHosts: ['558ca157cf87.ngrok-free.app'],
  },
	plugins: [sveltekit()]
});
