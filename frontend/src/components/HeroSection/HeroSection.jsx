import React, { useState, useEffect } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const [activeYacht, setActiveYacht] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const yachts = [
    {
      name: "Валькирия",
      description: "Cranchi Atlantique 43 FLY — моторная яхта с великолепными ходовыми качествами",
      price: "12 000 ₽/час",
      capacity: 10,
      image: "/src/assets/images/cards/val_1.png"
    },
    {
      name: "Байкал",
      description: "Компактная моторная яхта 8.6м. Салон из белой морской кожи",
      price: "6 000 ₽/час",
      capacity: 7,
      image: "/src/assets/images/cards/bayc_1.png"
    },
    {
      name: "Скарлетт О’Хара",
      description: "Парусно-моторный катамаран Lagoon 380 (12м). 4 каюты, широкие проходы",
      price: "12 000 ₽/час",
      capacity: 10,
      image: "/src/assets/images/cards/scar_1.png"
    }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleYachtChange = (index) => {
    setActiveYacht(index);
  };

  return (
    <section className="hero-section" id="hero">
      {/* Animated water background */}
      <div className="water-background">
        <div className="water-layer water-layer-1"></div>
        <div className="water-layer water-layer-2"></div>
        <div className="water-layer water-layer-3"></div>
      </div>
      
      {/* Interactive yacht elements */}
      <div className="interactive-yachts">
        {yachts.map((yacht, index) => (
          <div 
            key={index}
            className={`yacht-element ${index === activeYacht ? 'active' : ''}`}
            style={{
              transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.01 * (index + 1)}px, ${(mousePosition.y - window.innerHeight / 2) * 0.005 * (index + 1)}px)`
            }}
            onClick={() => handleYachtChange(index)}
          >
            <img src={yacht.image} alt={yacht.name} className="yacht-image" />
          </div>
        ))}
      </div>

      {/* Floating content container */}
      <div className="hero-content-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-line-1">Yacht Charter</span>
            <span className="title-line-2">Sochi</span>
            <span className="title-accent">Неповторимые впечатления</span>
          </h1>
          
          <p className="hero-subtitle">
            Аренда яхт, катеров, катамаранов и гидроциклов. 
            <span className="subtitle-highlight">Прямой собственник</span>
          </p>

          <div className="hero-navigation">
            <div className="yacht-selector">
              {yachts.map((_, index) => (
                <button
                  key={index}
                  className={`selector-dot ${index === activeYacht ? 'active' : ''}`}
                  onClick={() => handleYachtChange(index)}
                  aria-label={`Показать яхту ${yachts[index].name}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-buttons">
            <button className="btn-primary hero-btn">
              <span className="btn-text">Выбрать яхту</span>
              <span className="btn-icon">⛵</span>
            </button>
            <button className="btn-secondary hero-btn">
              <span className="btn-text">Узнать больше</span>
              <span className="btn-icon">🌊</span>
            </button>
          </div>
        </div>
      </div>

      {/* Animated wave elements */}
      <div className="wave-elements">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>

      {/* Floating info cards */}
      <div className="floating-cards">
        {yachts.map((yacht, index) => (
          <div 
            key={index}
            className={`floating-card ${index === activeYacht ? 'active' : ''}`}
          >
            <h3 className="card-title">{yacht.name}</h3>
            <p className="card-description">{yacht.description}</p>
            <div className="card-stats">
              <span className="card-price">{yacht.price}</span>
              <span className="card-capacity">👥 {yacht.capacity}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;