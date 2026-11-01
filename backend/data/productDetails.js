// Gallery, specifications and colours, matched to products by name
const gallery = (slug, count = 3) =>
  Array.from({ length: count - 1 }, (_, i) => `/images/gallery/${slug}-${i + 2}.webp`)

const productDetails = {
  'Apple iPhone 13 Pro': {
    images: gallery('iphone-13-pro'),
    specifications: [
      { label: 'Display', value: '6.1-inch Super Retina XDR, 120Hz' },
      { label: 'Processor', value: 'A15 Bionic' },
      { label: 'Rear camera', value: 'Triple 12MP' },
      { label: 'Front camera', value: '12MP' },
      { label: 'Connectivity', value: '5G, Wi-Fi 6, Bluetooth 5.0' },
      { label: 'Water resistance', value: 'IP68' },
    ],
    colors: [
      { name: 'Sierra Blue', hex: '#a7c1d9' },
      { name: 'Graphite', hex: '#54524f' },
      { name: 'Gold', hex: '#f4e8ce' },
      { name: 'Silver', hex: '#f1f2ed' },
    ],
  },
  'Apple iPhone X': {
    images: gallery('iphone-x'),
    specifications: [
      { label: 'Display', value: '5.8-inch Super Retina OLED' },
      { label: 'Processor', value: 'A11 Bionic' },
      { label: 'Rear camera', value: 'Dual 12MP' },
      { label: 'Security', value: 'Face ID' },
      { label: 'Water resistance', value: 'IP67' },
    ],
    colors: [
      { name: 'Space Grey', hex: '#3b3b3d' },
      { name: 'Silver', hex: '#e8e8e6' },
    ],
  },
  'Oppo F19 Pro Plus 5G': {
    images: gallery('oppo-f19'),
    specifications: [
      { label: 'Display', value: '6.43-inch AMOLED' },
      { label: 'Rear camera', value: '48MP quad camera' },
      { label: 'Battery', value: '4310mAh' },
      { label: 'Charging', value: '50W fast charging' },
      { label: 'Connectivity', value: '5G' },
    ],
    colors: [
      { name: 'Fluid Black', hex: '#23252a' },
      { name: 'Space Silver', hex: '#c9ccd1' },
    ],
  },
  'Realme C35': {
    images: gallery('realme-c35'),
    specifications: [
      { label: 'Display', value: '6.6-inch FHD+' },
      { label: 'Rear camera', value: '50MP AI triple camera' },
      { label: 'Battery', value: '5000mAh' },
      { label: 'Charging', value: '18W fast charging' },
    ],
    colors: [
      { name: 'Glowing Green', hex: '#bcd9b8' },
      { name: 'Glowing Black', hex: '#2b2d30' },
    ],
  },
  'Apple MacBook Pro 14-inch': {
    images: gallery('macbook-pro-14'),
    specifications: [
      { label: 'Display', value: '14.2-inch Liquid Retina XDR' },
      { label: 'Processor', value: 'Apple silicon' },
      { label: 'Ports', value: 'Thunderbolt, HDMI, SD card, MagSafe' },
      { label: 'Keyboard', value: 'Backlit Magic Keyboard with Touch ID' },
    ],
    colors: [
      { name: 'Space Grey', hex: '#5b5d60' },
      { name: 'Silver', hex: '#e3e4e5' },
    ],
  },
  'Dell XPS 13 9300': {
    images: gallery('dell-xps-13'),
    specifications: [
      { label: 'Display', value: '13.4-inch InfinityEdge' },
      { label: 'Processor', value: 'Intel Core' },
      { label: 'Body', value: 'Machined aluminium' },
      { label: 'Ports', value: 'Thunderbolt 3, microSD' },
    ],
    colors: [{ name: 'Platinum Silver', hex: '#d8d9da' }],
  },
  'Lenovo Yoga 920': {
    images: gallery('lenovo-yoga-920'),
    specifications: [
      { label: 'Display', value: '13.9-inch touchscreen' },
      { label: 'Design', value: '2-in-1 with watchband hinge' },
      { label: 'Input', value: 'Pen support' },
    ],
    colors: [
      { name: 'Platinum', hex: '#cfd1d3' },
      { name: 'Bronze', hex: '#a17c5b' },
    ],
  },
  'Asus Zenbook Pro Duo': {
    images: gallery('asus-zenbook-duo'),
    specifications: [
      { label: 'Main display', value: '4K OLED' },
      { label: 'Second display', value: 'Full-width ScreenPad Plus' },
      { label: 'Best for', value: 'Creative work' },
    ],
    colors: [{ name: 'Celestial Blue', hex: '#2b3f5c' }],
  },
  'Apple iPad mini 2021': {
    images: gallery('ipad-mini'),
    specifications: [
      { label: 'Display', value: '8.3-inch Liquid Retina' },
      { label: 'Processor', value: 'A15 Bionic' },
      { label: 'Stylus', value: 'Apple Pencil (2nd generation)' },
      { label: 'Security', value: 'Touch ID' },
    ],
    colors: [
      { name: 'Starlight', hex: '#ece6dc' },
      { name: 'Space Grey', hex: '#55565a' },
      { name: 'Pink', hex: '#f3d2d0' },
      { name: 'Purple', hex: '#c9bfdf' },
    ],
  },
  'Samsung Galaxy Tab S8+': {
    images: gallery('galaxy-tab-s8'),
    specifications: [
      { label: 'Display', value: '12.4-inch Super AMOLED, 120Hz' },
      { label: 'Battery', value: '10090mAh' },
      { label: 'Stylus', value: 'S Pen included' },
    ],
    colors: [
      { name: 'Graphite', hex: '#4a4c50' },
      { name: 'Silver', hex: '#d9dadc' },
    ],
  },
  'Apple AirPods': {
    images: gallery('airpods'),
    specifications: [
      { label: 'Type', value: 'Wireless earbuds' },
      { label: 'Listening time', value: 'Over 24 hours with the case' },
      { label: 'Controls', value: 'Voice control' },
    ],
    colors: [{ name: 'White', hex: '#f5f5f5' }],
  },
  'Apple AirPods Max': {
    specifications: [
      { label: 'Type', value: 'Over-ear headphones' },
      { label: 'Noise control', value: 'Active noise cancellation' },
      { label: 'Audio', value: 'Spatial audio' },
    ],
    colors: [
      { name: 'Silver', hex: '#dcdddf' },
      { name: 'Space Grey', hex: '#55565a' },
    ],
  },
  'Apple HomePod mini': {
    specifications: [
      { label: 'Type', value: 'Smart speaker' },
      { label: 'Audio', value: '360-degree sound' },
      { label: 'Assistant', value: 'Siri' },
    ],
    colors: [
      { name: 'Cosmic Grey', hex: '#3c3d40' },
      { name: 'White', hex: '#f2f2f2' },
    ],
  },
  'Amazon Echo Plus': {
    images: gallery('echo-plus', 2),
    specifications: [
      { label: 'Type', value: 'Smart speaker' },
      { label: 'Assistant', value: 'Alexa' },
      { label: 'Smart home', value: 'Built-in hub' },
    ],
    colors: [{ name: 'Charcoal', hex: '#4a4c4f' }],
  },
  'Apple Watch Series 4': {
    images: gallery('apple-watch-s4'),
    specifications: [
      { label: 'Case', value: 'Gold aluminium' },
      { label: 'Band', value: 'Sport band' },
      { label: 'Health', value: 'ECG, fall detection' },
    ],
    colors: [{ name: 'Gold', hex: '#e6c9a8' }],
  },
  'Apple MagSafe Battery Pack': {
    images: gallery('magsafe-battery', 2),
    specifications: [
      { label: 'Works with', value: 'MagSafe iPhones' },
      { label: 'Charging', value: 'Wireless' },
    ],
    colors: [{ name: 'White', hex: '#f4f4f4' }],
  },
}

export default productDetails
