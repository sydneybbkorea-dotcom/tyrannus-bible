// main.js — ES module entry point (for Vite bundling)
// Progressive migration: imports new core modules first, existing files loaded via <script> tags

// Core modules (Phase 1)
import './core/event-bus.js';
import './core/uri.js';
import './core/idb-store.js';
import './core/storage-adapter.js';
import './core/link-registry.js';

// Universal link system (Phase 2)
import './core/nav-router.js';
import './core/backlink-panel.js';
import './core/link-picker.js';

// UI foundation (Phase 0)
import './core/i18n.js';
import './core/input-manager.js';
import './theme-switcher.js';

// PDF system (Phase 3)
import './pdf/pdf-viewer.js';
import './pdf/pdf-annotations.js';
import './pdf/pdf-tools.js';
import './pdf/pdf-drag-to-note.js';

// Knowledge Graph (Phase 4)
import './graph/knowledge-graph.js';
import './graph/graph-filter.js';

// Note: existing files (bible-renderer.js, notes-*.js, etc.)
// remain as <script> tags and are migrated incrementally.
// When migrating a file to ESM:
// 1. Add `export` to its public functions
// 2. Import it here
// 3. Remove its <script> tag from index.html
// 4. Assign exports to window for backward compatibility if needed
