import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import OptimizedImage from './OptimizedImage';

export default function ProductMediaCarousel({ images = [], videos = [], alt = '', aspect = 'aspect-4/5' }) {
  const media = [...(images || []), ...(videos || [])];
  if (media.length === 0) {
    return (
      <div className={`${aspect} flex items-center justify-center bg-gray-200 rounded-xl`}>
        <span className="text-4xl text-gray-400">📱</span>
      </div>
    );
  }
  return (
    <div className={`w-full max-w-[480px] mx-auto ${aspect}`} style={{ maxWidth: '100vw' }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        className={`rounded-xl overflow-hidden w-full h-full`}
        style={{ width: '100%', height: '100%' }}
        navigation={false}
      >
        {media.map((url, idx) => (
          <SwiperSlide key={idx}>
            {url.match(/\.(mp4|webm)$/i) ? (
              <video src={url} className="w-full h-full object-cover" controls autoPlay muted loop playsInline />
            ) : (
              <OptimizedImage src={url} alt={alt} className="w-full h-full object-cover" />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
