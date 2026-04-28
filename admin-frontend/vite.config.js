import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          // Firebase — largest single dep, always cached separately
          if (id.includes('firebase')) return 'vendor-firebase'

          // TipTap rich text editor + its ProseMirror engine — large, only loaded on pages with editor
          if (id.includes('@tiptap') || id.includes('prosemirror') || id.includes('rope-sequence')) return 'vendor-tiptap'

          // Map libraries — rarely visited pages
          if (id.includes('leaflet')) return 'vendor-map'

          // Drag-and-drop — history + breaking news pages only
          if (id.includes('@dnd-kit')) return 'vendor-dnd'

          // Table — loaded on most list pages, cache as one chunk
          if (id.includes('@tanstack')) return 'vendor-table'

          // Icon library — large, shared across all pages
          if (id.includes('lucide-react')) return 'vendor-icons'

          // Date utilities — shared by forms and list pages
          if (id.includes('date-fns') || id.includes('react-datepicker')) return 'vendor-dates'

          // React core — never changes between deploys, long cache TTL
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'

          // Everything else in node_modules → single shared vendor chunk
          return 'vendor'
        },
      },
    },
  },
})
