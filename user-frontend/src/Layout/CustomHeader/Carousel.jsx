import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CarouselImg1 from '../../assets/images/carousel_1.jpg';
import CarouselImg2 from '../../assets/images/carousel_2.jpg';
import CarouselImg3 from '../../assets/images/carousel_3.jpg';
import CarouselImg4 from '../../assets/images/carousel_4.jpg';
import CarouselImg5 from '../../assets/images/carousel_5.jpg';

const slides = [
  { id: 1, image: CarouselImg1, title: "Penchalakona Temple" },
  { id: 2, image: CarouselImg2, title: "Pennar Sangam Barrage" },
  { id: 3, image: CarouselImg3, title: "Penchalakona Waterfalls" },
  { id: 4, image: CarouselImg4, title: "Talpagiri Temple" },
  { id: 5, image: CarouselImg5, title: "Kandaleru River" },
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: footerData } = useSelector((state) => state.footer);
  const siteName = footerData?.siteName || 'NELLORIENS';

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden bg-black h-65 md:h-125 lg:h-[calc(100dvh-175px)]"
      style={{ minHeight: 260 }}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-1' : 'opacity-0 z-0'}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-2"
        style={{ background: 'linear-gradient(to bottom, rgba(0,40,130,0.55) 0%, rgba(0,0,0,0.35) 100%)' }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-3 flex flex-col justify-center items-center text-center text-white px-4">
        <span
          className="font-black mb-3 tracking-widest"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            color: '#00B8FF',
            textShadow: '0 0 30px rgba(0,184,255,0.4)',
            animation: 'fadeInDown 0.8s ease-out',
            fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
            textTransform: 'uppercase',
          }}
        >
          {siteName}
        </span>
        <h2
          key={currentSlide}
          className="font-bold m-0"
          style={{
            fontSize: 'clamp(1.2rem, 3.5vw, 2.6rem)',
            textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
            animation: 'fadeInUp 0.8s ease-out',
            maxWidth: '80%',
          }}
        >
          {slides[currentSlide].title}
        </h2>
      </div>

      {/* Indicators — centered */}
      <div className="absolute bottom-6 inset-x-0 z-4 flex justify-center items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="border-0 p-0 cursor-pointer transition-all duration-300 rounded-full"
            style={{
              width: index === currentSlide ? 28 : 8,
              height: 8,
              background: index === currentSlide ? '#ffffff' : 'rgba(255,255,255,0.4)',
              boxShadow: index === currentSlide ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Carousel;
