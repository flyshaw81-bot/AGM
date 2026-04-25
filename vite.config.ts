export default {
    root: './src',
    base: process.env.NETLIFY ? '/' : '/AGM-Studio/',
    build: {
        outDir: '../dist',
        assetsDir: './',
    },
    publicDir: '../public',
}