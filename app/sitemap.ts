import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://iamhussain.dev/',
      lastModified: new Date(),
    },
    {
      url: 'https://iamhussain.dev/login',
      lastModified: new Date(),
    },
    {
      url: 'https://iamhussain.dev/dashboard',
      lastModified: new Date(),
    },
    {
      url: 'https://iamhussain.dev/dashboard/home',
      lastModified: new Date(),
    },
    {
      url: 'https://iamhussain.dev/users',
      lastModified: new Date(),
    },
  ]
}
