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
    // ✅ Responsive: max-w-md en móvil, max-w-lg en tablet, sin límite en desktop
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-none mx-auto">
      <div className={`${aspect} relative overflow-hidden rounded-xl`}>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={media.length > 1}
          className="absolute inset-0 w-full h-full"
        >
          {media.map((url, idx) => (
            <SwiperSlide key={idx} className="w-full h-full">
              {url.match(/\.(mp4|webm)$/i) ? (
                <video 
                  src={url} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                />
              ) : (
                <OptimizedImage 
                  src={url} 
                  alt={alt} 
                  className="w-full h-full object-cover" 
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}