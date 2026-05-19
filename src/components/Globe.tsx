import React, { useEffect, useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import { OrbitControls, Stars } from "@react-three/drei";
import { CITIES } from "../data/cities";
import { TransportType, Entity } from "../types";

interface GlobeProps {
  entities: Entity[];
  onCityClick?: (cityId: string) => void;
  selectedEntityId?: string | null;
}

const Globe: React.FC<GlobeProps> = ({ entities, selectedEntityId }) => {
  const globeRef = useRef<ThreeGlobe>(null!);
  const { scene } = useThree();

  // Create the globe instance once
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .atmosphereColor("#06b6d4")
      .atmosphereAltitude(0.15)
      .pointAltitude(0)
      .pointColor(() => "#06b6d4")
      .pointRadius(0.12)
      .labelColor(() => "rgba(255, 255, 255, 0.7)")
      .labelText("text")
      .labelSize(0.5)
      .arcStroke(0.2)
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashAnimateTime(2000);

    // Initial points/labels are static
    g.pointsData(CITIES.map(city => ({
      lat: city.lat,
      lng: city.lng,
      name: city.name,
    })));

    g.labelsData(CITIES.map(city => ({
      lat: city.lat,
      lng: city.lng,
      text: city.name,
    })));

    return g;
  }, []);

  // Update arcs only when entities change significantly
  useEffect(() => {
    if (!globe) return;

    const arcs = entities.map(entity => ({
      startLat: entity.from.lat,
      startLng: entity.from.lng,
      endLat: entity.to.lat,
      endLng: entity.to.lng,
      color: entity.type === TransportType.FLIGHT ? ["#06b6d4", "#818cf8"] : ["#10b981", "#06b6d4"],
    }));

    globe.arcsData(arcs);
    globe.arcColor("color");
  }, [globe, entities]);

  useFrame((state, delta) => {
    if (globe && !selectedEntityId) {
      globe.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      <primitive object={globe} />
      <ambientLight intensity={2} />
      <pointLight position={[100, 100, 100]} intensity={1.5} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
      <OrbitControls 
        enablePan={false} 
        minDistance={150} 
        maxDistance={400} 
        autoRotate={false}
      />
    </>
  );
};

export default Globe;
