/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });
        return config;
    },
    redirects: async() => [
        {
            source: '/',
            destination: '/home',
            permanent: true
        }
    ]
}

export default nextConfig;