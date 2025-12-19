
// export const URI= 'http://localhost:3000';
export const URI = import.meta.env.VITE_API_URL || 'https://vha-store.vercel.app';
export const carouselImages = [
    'https://vkovic.github.io/uikit-computer-store-template/images/promo/macbook-new.jpg',
    'https://vkovic.github.io/uikit-computer-store-template/images/promo/iphone.jpg',
    'https://vkovic.github.io/uikit-computer-store-template/images/promo/ipad.jpg',
   
  ];
  
  export const categoryImages = [
    {
      title: 'Mobiles',
      image: '/images/mobiles.jpeg',
    },
    {
      title: 'Essentials',
      image: '/images/essentials.jpeg',
    },
    {
      title: 'Appliances',
      image: '/images/appliances.jpeg',
    },
    {
      title: 'Books',
      image: '/images/books.jpeg',
    },
    {
      title: 'Fashion',
      image: '/images/fashion.jpeg',
    },
  ];