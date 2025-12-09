/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [],
  },

  // Turbopack - pliki audio są obsługiwane automatycznie jako assety
  turbopack: {},

  // Obsługa plików audio dla webpack (używane przy: npm run build)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    return config;
  },

  // Zmienne środowiskowe są automatycznie dostępne dzięki NEXT_PUBLIC_ prefix
}

export default nextConfig
