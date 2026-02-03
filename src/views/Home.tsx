import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faCreditCard, faCalendar, faMessage } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
const GymHome: React.FC = () => {
  const navigate = useNavigate();
  const features = [
    {
      id: 1,
      title: 'Gestión de Clientes',
      description: 'Administra toda la información de tus clientes de manera eficiente',
      icon: faUsers,
      path: '/home/clients'
    },
    {
      id: 2,
      title: 'Planes de Entrenamiento',
      description: 'Crea y gestiona diferentes planes adaptados a cada necesidad',
      icon: faCalendar,
      path: '/home/plans'
    },
    {
      id: 3,
      title: 'Membresías',
      description: 'Controla las membresías activas, vencimientos y renovaciones',
      icon: faCreditCard,
      path: '/home/memberships'
    },
    {
      id: 4,
      title: 'Asistente IA',
      description: 'Obtén ayuda inteligente para gestionar tu gimnasio de forma óptima',
      icon: faMessage,
      path: '/home/chat'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#009689' }}>
            Bienvenido al Sistema de Control de Gimnasios
          </h1>
          <p className="text-gray-600 text-lg">
            Gestiona tu gimnasio de manera profesional con nuestras herramientas integradas
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group"
                onClick={() => {
                  // Aquí puedes agregar navegación: navigate(feature.path)
                   navigate(feature.path);
                }}
              >
                <div 
                  className="h-2 w-full" 
                  style={{ backgroundColor: '#009689' }}
                />
                
                <div className="p-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: '#009689' }}
                  >
                    <FontAwesomeIcon icon={Icon} className="size-4" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-center text-sm">
                    {feature.description}
                  </p>
                </div>

                <div 
                  className="px-6 py-4 text-center group-hover:bg-opacity-10 transition-colors duration-300"
                  style={{ backgroundColor: 'rgba(0, 150, 137, 0.05)' }}
                >
                  <span 
                    className="text-sm font-medium"
                    style={{ color: '#009689' }}
                  >
                    Acceder →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-lg shadow-md px-8 py-4">
            <p className="text-gray-600">
              ¿Necesitas ayuda? Utiliza nuestro{' '}
              <span 
                className="font-semibold cursor-pointer hover:underline"
                style={{ color: '#009689' }}
              >
                Asistente de IA
              </span>
              {' '}para obtener soporte instantáneo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymHome;