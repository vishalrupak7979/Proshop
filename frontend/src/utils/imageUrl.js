import { baseURL } from '../api/axios'

// Product images are served by the API, unless a product stores a full URL
export const imageUrl = (image) => (/^https?:/.test(image) ? image : `${baseURL}${image}`)
