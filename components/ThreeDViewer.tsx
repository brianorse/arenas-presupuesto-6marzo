import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Text, 
  Sky, 
  Float,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { Loader2, AlertCircle } from 'lucide-react';

// Error Boundary for 3D Scene
class SceneErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="bg-black/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center max-w-sm shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Error de Visualización</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              No se pudo cargar el entorno 3D. Esto puede deberse a la configuración de tu navegador o falta de memoria gráfica.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors"
            >
              Recargar Aplicación
            </button>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
          <Loader2 className="w-16 h-16 text-white animate-spin relative z-10 opacity-80" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white font-bold text-sm tracking-[0.2em] uppercase">Cargando Escena</p>
          <p className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">Optimizando texturas</p>
        </div>
      </div>
    </Html>
  );
}

interface ElementoPlano {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  rotation?: number;
  text?: string;
  category?: string;
  fontSize?: number;
  sillas?: number;
  invitados?: string;
  locked?: boolean;
}

interface ThreeDViewerProps {
  elements: ElementoPlano[];
  tipo?: 'interior' | 'exterior';
  onClose: () => void;
}

// Stylized 3D Person
const Person3D = ({ position, rotation }: { position: [number, number, number], rotation: number }) => {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
        <meshStandardMaterial color="#444" roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#d2b48c" roughness={0.5} />
      </mesh>
      {/* Arms (simplified) */}
      <mesh position={[0.2, 1.1, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.2, 1.1, 0]} rotation={[0, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
};

// Realistic Table Components
const HighTableStretch = ({ color, x, z }: { color: string, x: number, z: number }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * 1.1;
      const r = 0.15 + Math.pow(i / 10 - 0.5, 2) * 0.6;
      pts.push(new THREE.Vector2(r, y));
    }
    return pts;
  }, []);
  
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.6} 
          clearcoat={0.1}
          transmission={0.05}
          thickness={0.1}
        />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.02, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
};

const HighTableFolding = ({ x, z }: { x: number, z: number }) => {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.03, 32]} />
        <meshStandardMaterial 
          color="#f0f0f0" 
          roughness={0.4} 
        />
      </mesh>
      <group rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      <group rotation={[0, -Math.PI / 4, 0]}>
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const Table3D = ({ element }: { element: ElementoPlano }) => {
  const width = (element.width || 100) / 20;
  const depth = (element.height || 100) / 20;
  const x = (element.x + (element.width || 0) / 2 - 400) / 20;
  const z = (element.y + (element.height || 0) / 2 - 300) / 20;
  const rotation = (element.rotation || 0) * (Math.PI / 180);
  
  const isHighTable = element.category === 'highTable' || (element.width && element.width < 70);
  
  if (isHighTable) {
    const isStretch = element.id.length % 2 === 0;
    return (
      <group>
        {isStretch ? (
          <HighTableStretch color={element.fill || '#ffffff'} x={x} z={z} />
        ) : (
          <HighTableFolding x={x} z={z} />
        )}
        <Text
          position={[x, 1.2, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.12}
          color="#000"
          anchorX="center"
          anchorY="middle"
        >
          {element.text}
        </Text>
      </group>
    );
  }

  const tableHeight = 0.75;

  return (
    <group position={[x, 0, z]} rotation={[0, -rotation, 0]}>
      {/* Tablecloth / Top */}
      <mesh position={[0, tableHeight, 0]} castShadow receiveShadow>
        {element.type === 'circle' ? (
          <cylinderGeometry args={[width / 2 + 0.05, width / 2 + 0.05, 0.1, 32]} />
        ) : (
          <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
        )}
        <meshStandardMaterial 
          color={element.fill || '#ffffff'} 
          roughness={0.8} 
        />
      </mesh>
      
      {/* Tablecloth Skirt (hanging down) */}
      <mesh position={[0, tableHeight - 0.15, 0]}>
        {element.type === 'circle' ? (
          <cylinderGeometry args={[width / 2 + 0.05, width / 2 + 0.06, 0.3, 32, 1, true]} />
        ) : (
          <boxGeometry args={[width + 0.1, 0.3, depth + 0.1]} />
        )}
        <meshStandardMaterial color={element.fill || '#ffffff'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Chairs */}
      {Array.from({ length: element.sillas || 0 }).map((_, i) => {
        const angle = (i / (element.sillas || 1)) * Math.PI * 2;
        const chairRadius = (width / 2) + 0.5;
        const cx = Math.cos(angle) * chairRadius;
        const cz = Math.sin(angle) * chairRadius;
        
        const invitadosArray = (element.invitados || '').split('\n');
        const guestName = invitadosArray[i] || '';
        const hasPerson = i < 3 && element.id.length % 3 === 0; // Randomly add people for atmosphere
        
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -angle + Math.PI / 2, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.4, 0.06, 0.4]} />
              <meshStandardMaterial color="#222" roughness={0.5} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.8, 0.18]} castShadow>
              <boxGeometry args={[0.4, 0.7, 0.05]} />
              <meshStandardMaterial color="#222" roughness={0.5} />
            </mesh>
            {/* Metal Legs */}
            <mesh position={[0.18, 0.225, 0.18]} castShadow><cylinderGeometry args={[0.015, 0.015, 0.45]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
            <mesh position={[-0.18, 0.225, 0.18]} castShadow><cylinderGeometry args={[0.015, 0.015, 0.45]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
            <mesh position={[0.18, 0.225, -0.18]} castShadow><cylinderGeometry args={[0.015, 0.015, 0.45]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
            <mesh position={[-0.18, 0.225, -0.18]} castShadow><cylinderGeometry args={[0.015, 0.015, 0.45]} /><meshStandardMaterial color="#888" metalness={0.8} /></mesh>
            
            {hasPerson && <Person3D position={[0, 0.45, 0]} rotation={0} />}
            
            {guestName && (
              <Text
                position={[0, 1.2, 0]}
                fontSize={0.12}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
              >
                {guestName}
              </Text>
            )}
          </group>
        );
      })}

      {/* Label */}
      <Text
        position={[0, tableHeight + 0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="#000"
        anchorX="center"
        anchorY="middle"
      >
        {element.text}
      </Text>
    </group>
  );
};

const Text3D = ({ element }: { element: ElementoPlano }) => {
  const x = (element.x - 400) / 20;
  const z = (element.y - 300) / 20;
  return (
    <Text
      position={[x, 0.01, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={(element.fontSize || 20) / 100}
      color={element.fill || "#000"}
      anchorX="left"
      anchorY="top"
    >
      {element.text}
    </Text>
  );
};

const Scene = ({ elements, tipo }: { elements: ElementoPlano[], tipo: 'interior' | 'exterior' }) => {
  const isGarden = tipo === 'exterior' || elements.some(el => el.category === 'garden' || el.category === 'water');
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={45} />
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} 
        enableDamping 
        dampingFactor={0.1}
      />
      
      {isGarden && <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />}
      
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[512, 512]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Floor - Using solid colors for 100% reliability */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color={isGarden ? "#3a4d2c" : "#dcdcdc"} 
          roughness={0.9}
        />
      </mesh>
      
      {/* Grid for reference */}
      <gridHelper args={[100, 50, "#bbbbbb", "#dddddd"]} position={[0, 0.01, 0]} />

      {/* Elements */}
      {elements.map((el) => {
        if (el.type === 'text') return <Text3D key={el.id} element={el} />;
        return <Table3D key={el.id} element={el} />;
      })}

      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.4} 
        scale={60} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000"
      />
    </>
  );
};

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ elements, tipo = 'interior', onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col animate-in fade-in duration-500">
      <div className="p-4 bg-[#1a0f0a] border-b border-white/10 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#6BCB77] rounded-full flex items-center justify-center shadow-lg shadow-[#6BCB77]/20">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Experiencia 3D Inmersiva</h2>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Visualización en tiempo real</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-white text-[#1a0f0a] hover:bg-[#ede3d6] rounded-2xl transition-all font-bold text-sm shadow-xl active:scale-95"
        >
          Finalizar Recorrido
        </button>
      </div>
      
      <div className="flex-1 relative">
        <Canvas 
          shadows 
          gl={{ 
            antialias: true, 
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            alpha: false
          }}
          dpr={[1, 2]} // Limit pixel ratio for performance
        >
          <Suspense fallback={<LoadingSpinner />}>
            <SceneErrorBoundary>
              <Scene elements={elements} tipo={tipo} />
            </SceneErrorBoundary>
          </Suspense>
        </Canvas>
        
        {/* Overlay UI */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-2">
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white/80 text-xs flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#6BCB77] rounded-full animate-pulse" />
              <span>Click Izquierdo: Rotar Cámara</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#4D96FF] rounded-full animate-pulse" />
              <span>Click Derecho: Desplazar</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#FFD93D] rounded-full animate-pulse" />
              <span>Rueda: Zoom Acercar/Alejar</span>
            </div>
          </div>
        </div>

        <div className="absolute top-8 right-8">
          <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
              {tipo === 'interior' ? 'Salón de Banquetes' : 'Terraza & Jardín'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
