import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers, faCreditCard, faCalendar, faMessage,
  faCheck, faMagic, faMobileScreen, faBolt,
  faClock, faArrowTrendUp, faBars, faTimes,
  faChartLine, faDumbbell, faShieldHalved, faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
// ── Utility: simple fade-in on scroll ──────────────────────────────────────
function useFadeIn() {
  const ref = useRef<any>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

// ── Palette & helpers ───────────────────────────────────────────────────────
const P = "#009689";
const PD = "#007a6e";
const PL = "#e0f5f3";

// ── Components ──────────────────────────────────────────────────────────────

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const nav = ["Características", "Planes", "Contacto"];
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,150,137,0.1)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>
            <FontAwesomeIcon icon={faDumbbell} className="text-xs" />
          </div>
          <span className="font-black text-xl tracking-tight" style={{ color: P, fontFamily: "'Syne', sans-serif" }}>GymOS</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {nav.map(n => (
            <a key={n} href={`#${n.toLowerCase()}`} className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors">{n}</a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <NavLink to="/login" className="px-4 py-2 text-sm font-semibold rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors">Iniciar sesión</NavLink>
          <NavLink to="/register" className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all hover:shadow-lg active:scale-95"
            style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>
            Registrarse
          </NavLink>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-700" onClick={() => setOpen(!open)}>
          <FontAwesomeIcon icon={open ? faTimes : faBars} className="text-xl" />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {nav.map(n => <a key={n} href={`#${n.toLowerCase()}`} className="block text-sm font-semibold text-gray-700 py-2">{n}</a>)}
          <div className="flex gap-3 pt-2">
            <NavLink to="/login" className="flex-1 py-2 text-sm font-semibold rounded-xl text-teal-700 bg-teal-50 text-center">Iniciar sesión</NavLink>
            <NavLink to="/register" className="flex-1 py-2 text-sm font-semibold rounded-xl text-white text-center" style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>Registrarse</NavLink>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden" style={{ background: "linear-gradient(160deg, #f0fdfb 0%, #ffffff 50%, #f8fffe 100%)" }}>
      {/* Decorative blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: P }} />
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: P }} />

      {/* Grid lines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(${P} 1px, transparent 1px), linear-gradient(90deg, ${P} 1px, transparent 1px)`,
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-8 border"
          style={{ color: P, background: PL, borderColor: `${P}30` }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: P }} />
          Sistema de gestión #1 para gimnasios
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.15] mb-6 text-gray-900">
          Gestiona tu gym<br />
          <span className="relative">
            <span style={{ color: P }}>sin complicaciones</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
              <path d="M2 10 Q200 2 398 10" stroke={P} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
            </svg>
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Clientes, membresías, pagos y planes de entrenamiento — todo en un solo lugar, potenciado con Inteligencia Artificial.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-2xl text-white shadow-xl hover:shadow-2xl transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}>
            Comenzar gratis →
          </button>
          <button className="w-full sm:w-auto px-8 py-4 text-base font-bold rounded-2xl text-gray-700 bg-white border border-gray-200 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm">
            Ver demostración
          </button>
        </div>

        {/* Stats row
        <div className="inline-grid grid-cols-3 gap-px rounded-2xl overflow-hidden shadow-lg bg-gray-200">
          {[
            { value: "+2,400", label: "Gimnasios activos" },
            { value: "98%", label: "Satisfacción" },
            { value: "24/7", label: "Soporte IA" },
          ].map((s, i) => (
            <div key={i} className="bg-white px-8 py-5 text-center">
              <div className="text-2xl font-black" style={{ color: P }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}

function Features() {
  const [ref, visible] = useFadeIn();
  const features = [
    { id: 1, title: "Gestión de Clientes", description: "Administra toda la información de tus clientes de manera eficiente y centralizada.", icon: faUsers, path: "/home/clients" },
    { id: 2, title: "Planes de Entrenamiento", description: "Crea y gestiona planes de entrenamiento adaptados a cada necesidad específica.", icon: faCalendar, path: "/home/plans" },
    { id: 3, title: "Membresías", description: "Controla membresías activas, fechas de vencimiento y renovaciones automáticas.", icon: faCreditCard, path: "/home/memberships" },
    { id: 4, title: "Asistente IA", description: "Inteligencia artificial integrada para optimizar la gestión de tu gimnasio.", icon: faMessage, path: "/home/chat" },
    { id: 5, title: "Reportes & Métricas", description: "Visualiza el rendimiento de tu negocio con dashboards en tiempo real.", icon: faChartLine, path: "/home/reports" },
    { id: 6, title: "Seguridad Total", description: "Tus datos protegidos con encriptación de nivel bancario y backups automáticos.", icon: faShieldHalved, path: "/home/security" },
  ];

  return (
    <section id="características" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: P, background: PL }}>Características</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black leading-tight text-gray-900">
            Todo lo que necesitas,<br />en un solo sistema
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">Herramientas profesionales diseñadas específicamente para la industria del fitness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.id}
              className={`group relative bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:border-teal-200 transition-all duration-300 cursor-pointer overflow-hidden ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Hover background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: `linear-gradient(135deg, ${PL} 0%, transparent 60%)` }} />

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-white group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>
                  <FontAwesomeIcon icon={f.icon} className="text-sm" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                <div className="mt-4 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: P }}>
                  Explorar →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const [ref, visible] = useFadeIn();
  const testimonials = [
    { name: "Carlos Méndez", gym: "FitZone Bogotá", text: "GymOS transformó completamente la gestión de mi gimnasio. Ahora proceso 3x más clientes con la mitad del esfuerzo.", avatar: "CM" },
    { name: "Laura Torres", gym: "Iron Gym Medellín", text: "El asistente de IA es increíble. Me sugiere promociones en momentos exactos y mis membresías activas subieron 40%.", avatar: "LT" },
    { name: "Roberto Silva", gym: "PowerHouse Cali", text: "La integración de pagos y membresías es perfecta. Cero errores, cero dolores de cabeza. Vale cada peso.", avatar: "RS" },
  ];

  return (
    <section className="py-24" style={{ background: "linear-gradient(160deg, #f0fdfb, #fff)" }} ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: P, background: PL }}>Testimonios</span>
          <h2 className="mt-4 text-4xl font-black leading-tight text-gray-900">
            Ellos ya confían en GymOS
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>{t.avatar}</div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.gym}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [ref, visible] = useFadeIn();
  const [hovered, setHovered] = useState<number | null>(null);

  const plans = [
    {
      name: "Básico", price: 29, badge: "Para empezar", icon: faBolt,
      description: "Gestión esencial para tu gimnasio",
      features: [
        { text: "Gestión de clientes", hi: true }, { text: "Gestión de planes" },
        { text: "Control de membresías" }, { text: "Historial de pagos" },
        { text: "Reportes básicos" }, { text: "Soporte por email" }
      ]
    },
    {
      name: "Pro", price: 49, badge: "Más popular", icon: faMagic, popular: true,
      description: "Automatiza con inteligencia artificial",
      features: [
        { text: "Todo del plan Básico", hi: true }, { text: "Asistente IA integrado", hi: true },
        { text: "Respuestas automáticas" }, { text: "Análisis predictivo" },
        { text: "Sugerencias inteligentes" }, { text: "Soporte prioritario" }
      ]
    },
    {
      name: "Premium", price: 69, badge: "Todo incluido", icon: faMobileScreen,
      description: "Solución completa con app y web",
      features: [
        { text: "Todo del plan Pro", hi: true }, { text: "App móvil", hi: true },
        { text: "Web personalizada", hi: true }, { text: "Soporte dedicado 24/7", hi: true }
      ]
    }
  ];

  return (
    <section id="planes" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: P, background: PL }}>Planes</span>
          <h2 className="mt-4 text-4xl sm:text-5xl font-black leading-tight text-gray-900">
            Elige tu plan y<br />
            <span style={{ color: P }}>transforma tu gym</span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">Sin contratos de permanencia. Cancela cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${hovered === i ? "scale-105" : ""}`}
              style={{ transitionDelay: `${i * 100}ms` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-bold text-white z-10 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>
                  {plan.badge}
                </div>
              )}
              <div className={`h-full bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 ${plan.popular ? "shadow-2xl" : "shadow-sm border-gray-100"}`}
                style={{ borderColor: plan.popular ? P : "transparent" }}>
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${P}, ${PD})` }} />
                <div className="p-8 space-y-7">
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4"
                      style={{ background: `linear-gradient(135deg, ${P}, ${PD})`, transform: hovered === i ? "rotate(6deg)" : "none", transition: "transform 0.3s" }}>
                      <FontAwesomeIcon icon={plan.icon} className="text-sm" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                    <div className="flex items-end gap-1 mt-4">
                      <span className="text-5xl font-black text-gray-900">${plan.price}</span>
                      <span className="text-gray-400 text-sm mb-2 font-medium">/mes</span>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: PL, color: P }}>
                          <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9 }} />
                        </div>
                        <span className={`text-sm ${f.hi ? "font-semibold text-gray-900" : "text-gray-500"}`}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg active:scale-95"
                    style={plan.popular
                      ? { background: `linear-gradient(135deg, ${P}, ${PD})`, color: "white" }
                      : { background: PL, color: P }
                    }>
                    Comenzar ahora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {[
            { icon: faUsers, text: "Gestión de clientes" },
            { icon: faCreditCard, text: "Pagos automatizados" },
            { icon: faClock, text: "Disponible 24/7" },
            { icon: faArrowTrendUp, text: "Reportes en tiempo real" }
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <FontAwesomeIcon icon={f.icon} style={{ color: P }} />
              <span className="text-sm font-medium text-gray-700">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const [ref, visible] = useFadeIn();
  return (
    <section className="py-20 relative overflow-hidden" ref={ref}
      style={{ background: `linear-gradient(135deg, ${P} 0%, ${PD} 100%)` }}>
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: `radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "white" }} />
      <div className={`relative z-10 max-w-3xl mx-auto px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <FontAwesomeIcon icon={faRocket} className="text-white opacity-70 text-3xl mb-5" />
        <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          ¿Listo para llevar tu gimnasio al siguiente nivel?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <NavLink to="/register" className="px-8 py-4 bg-white font-bold rounded-2xl text-base hover:shadow-xl transition-all active:scale-95" style={{ color: P }}>
            Crear cuenta gratis
          </NavLink>
          <button className="px-8 py-4 border-2 border-white border-opacity-50 text-white font-bold rounded-2xl text-base hover:bg-white hover:bg-opacity-10 transition-all">
            Hablar con ventas
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contacto" className="bg-gray-950 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${P}, ${PD})` }}>
                <FontAwesomeIcon icon={faDumbbell} className="text-xs" />
              </div>
              <span className="font-black text-xl text-white" style={{ fontFamily: "'Syne', sans-serif" }}>GymOS</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">El sistema de gestión más completo para gimnasios modernos. Tecnología al servicio del fitness.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Producto</h4>
            {["Características", "Planes", "Demo", "API"].map(l => <div key={l} className="text-sm py-1 hover:text-teal-400 cursor-pointer transition-colors">{l}</div>)}
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Empresa</h4>
            {["Acerca de", "Blog", "Contacto", "Privacidad"].map(l => <div key={l} className="text-sm py-1 hover:text-teal-400 cursor-pointer transition-colors">{l}</div>)}
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2025 FitLog. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/584127575904"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200"
      style={{ background: "linear-gradient(135deg, #25d366, #128c7e)" }}
      title="Contactar por WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white">1</span>
    </a>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function GymSaasLanding() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        html { scroll-behavior: smooth; }
      `}</style>
      <Header />
      <main>
        <Hero />
        <Features />
        <SocialProof />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}