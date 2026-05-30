import next from 'eslint-config-next';

// Flat-config для ESLint 9 + Next 16 (next lint удалён, запускаем eslint напрямую).
// eslint-config-next (default) уже включает core-web-vitals + typescript.
export default [
   { ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', 'eslint.config.mjs'] },
   ...next,
];
