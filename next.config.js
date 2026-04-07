/** @type {import('next').NextConfig} */
const nextConfig = {
  // NO AGREGAR "output: export"
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
