export default {
    root: './src',
    base: process.env.NETLIFY ? '/' : '/AGM-Studio/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        assetsDir: './',
        rollupOptions: {
            output: {
                manualChunks(id: string) {
                    const normalizedId = id.replace(/\\/g, '/');

                    if (!normalizedId.includes('/node_modules/')) {
                        if (normalizedId.includes('/src/studio/state/')) return 'studio-state';
                        if (normalizedId.includes('/src/studio/bridge/')) return 'studio-bridge';
                        if (normalizedId.includes('/src/studio/layout/')) return 'studio-layout';
                        if (normalizedId.includes('/src/studio/app/')) return 'studio-app';
                        if (normalizedId.includes('/src/studio/')) return 'studio-core';
                        return undefined;
                    }
                    if (normalizedId.includes('/d3')) return 'vendor-d3';
                    if (
                        normalizedId.includes('/alea/') ||
                        normalizedId.includes('/delaunator/') ||
                        normalizedId.includes('/lineclip/') ||
                        normalizedId.includes('/polylabel/')
                    ) {
                        return 'vendor-geometry';
                    }

                    return 'vendor';
                },
            },
        },
    },
    publicDir: '../public',
}
