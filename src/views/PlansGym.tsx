import React, { useState } from 'react';
import { faCheck, faMagic, faMobileScreen, faBolt, faUsers, faCreditCard, faClock, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface Plan {
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  icon: any; // Using any for simpler icon handling
  popular?: boolean;
  accentColor: string;
  badge?: string;
}

const GymPricingPage: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const plans: Plan[] = [
    {
      name: "Básico",
      price: 29,
      description: "Gestión esencial para tu gimnasio",
      badge: "Ideal para empezar",
      accentColor: "#009689",
      icon: faBolt,
      features: [
        { text: "Gestión de clientes", highlight: true },
        { text: "Gestión de planes" },
        { text: "Control de membresías" },
        { text: "Historial de pagos" },
        { text: "Reportes básicos" },
        { text: "Soporte por email" }
      ]
    },
    {
      name: "Pro",
      price: 49,
      description: "Automatiza con inteligencia artificial",
      badge: "Más popular",
      popular: true,
      accentColor: "#009689",
      icon: faMagic,
      features: [
        { text: "Todo del plan Básico", highlight: true },
        { text: "Asistente IA integrado", highlight: true },
        { text: "Respuestas automáticas" },
        { text: "Análisis predictivo" },
        { text: "Sugerencias inteligentes" },
        { text: "Soporte prioritario" }
      ]
    },
    {
      name: "Premium",
      price: 69,
      description: "Solución completa con app y web",
      badge: "Todo incluido",
      accentColor: "#009689",
      icon: faMobileScreen,
      features: [
        { text: "Todo del plan Pro", highlight: true },
        { text: "App móvil", highlight: true },
        { text: "Web personalizada", highlight: true },
        { text: "Soporte dedicado 24/7" }
      ]
    }
  ];

  const primaryColor = "#009689";

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: primaryColor }}></div>
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full opacity-5" style={{ backgroundColor: primaryColor }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-20 space-y-4">
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Elige tu plan <br />
            <span style={{ color: primaryColor }}>y transforma tu gym</span>
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Gestiona clientes, pagos y membresías con tecnología de vanguardia
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative transform transition-all duration-300 ${
                hoveredPlan === index ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className={`h-full bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 ${
                plan.popular ? 'shadow-2xl' : 'border-gray-100'
              }`} style={{ borderTopColor: primaryColor }}>
                
                {plan.popular && (
                  <div 
                    className="absolute top-0 right-8 transform -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform duration-300"
                      style={{ backgroundColor: primaryColor, transform: hoveredPlan === index ? 'rotate(6deg)' : 'none' }}
                    >
                      <FontAwesomeIcon icon={plan.icon} className="size-6" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{plan.name}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 font-medium">/mes</span>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div 
                          className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                          <FontAwesomeIcon icon={faCheck} className="text-[10px]" strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${feature.highlight ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className="w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg active:transform active:scale-95"
                    style={{ 
                      backgroundColor: plan.popular ? primaryColor : 'white',
                      color: plan.popular ? 'white' : primaryColor,
                      border: `2px solid ${primaryColor}`
                    }}
                  >
                    Comenzar ahora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: faUsers, text: "Gestión de clientes" },
            { icon: faCreditCard, text: "Pagos automatizados" },
            { icon: faClock, text: "Disponible 24/7" },
            { icon: faArrowTrendUp, text: "Reportes en tiempo real" }
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div style={{ color: primaryColor }}>
                <FontAwesomeIcon icon={feature.icon} className="size-5" />
              </div>
              <span className="text-gray-700 font-medium text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 text-gray-600">
          <p>
            ¿No estás seguro qué plan elegir?{' '}
            <button className="font-bold border-b-2 hover:opacity-80 transition-opacity" style={{ color: primaryColor, borderColor: `${primaryColor}40` }}>
              Contáctanos
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GymPricingPage;