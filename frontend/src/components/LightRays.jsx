// REEMPLAZAR LightRays.jsx con esta versión optimizada

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const LightRays = ({
  raysOrigin = 'top-center',
  raysColor = '#ffffff',
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  followMouse = false,
  mouseInfluence = 0.1,
  noiseAmount = 0.0,
  distortion = 0.0,
  className = ''
}) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // OPTIMIZACIÓN 1: Solo renderizar si es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    let renderer, mesh, animationId;
    
    const initWebGL = async () => {
      // OPTIMIZACIÓN 2: DPR reducido para mejor performance
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 1.5), // Limitar a 1.5x
        alpha: true,
        antialias: false, // Desactivar antialiasing para mejor FPS
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      containerRef.current.appendChild(gl.canvas);

      // Shaders simplificados para mejor performance
      const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec2 rayDir;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform vec2 mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);
  
  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
  
  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * 36.2 + iTime * raysSpeed)) +
    (0.3 + 0.2 * cos(-distortedAngle * 21.1 + iTime * raysSpeed)),
    0.0, 1.0
  );
  
  return baseStrength * lengthFalloff * spreadFactor;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }
  
  vec4 rays = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord);
  
  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    rays.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }
  
  float brightness = 1.0 - (coord.y / iResolution.y);
  rays.x *= 0.1 + brightness * 0.8;
  rays.y *= 0.3 + brightness * 0.6;
  rays.z *= 0.5 + brightness * 0.5;
  
  rays.rgb *= raysColor;
  gl_FragColor = rays;
}`;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion }
      };

      const geometry = new Triangle(gl);
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
      mesh = new Mesh(gl, { geometry, program });

      const updateSize = () => {
        if (!containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        renderer.setSize(clientWidth, clientHeight);
        const w = clientWidth * renderer.dpr;
        const h = clientHeight * renderer.dpr;
        uniforms.iResolution.value = [w, h];
        
        // Calcular posición de rayos
        const outside = 0.2;
        let anchor, dir;
        switch (raysOrigin) {
          case 'top-left':
            anchor = [0, -outside * h]; dir = [0, 1]; break;
          case 'top-right':
            anchor = [w, -outside * h]; dir = [0, 1]; break;
          default: // top-center
            anchor = [0.5 * w, -outside * h]; dir = [0, 1];
        }
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      // OPTIMIZACIÓN 3: Throttle de render loop (60 FPS max)
      let lastTime = 0;
      const targetFPS = 60;
      const frameTime = 1000 / targetFPS;

      const loop = (t) => {
        const deltaTime = t - lastTime;
        
        if (deltaTime >= frameTime) {
          lastTime = t - (deltaTime % frameTime);
          uniforms.iTime.value = t * 0.001;
          
          try {
            renderer.render({ scene: mesh });
          } catch (err) {
            console.warn('WebGL error:', err);
            if (cleanupRef.current) cleanupRef.current();
            return;
          }
        }
        
        animationId = requestAnimationFrame(loop);
      };

      animationId = requestAnimationFrame(loop);

      cleanupRef.current = () => {
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', updateSize);
        
        try {
          const canvas = renderer.gl.canvas;
          const loseExt = renderer.gl.getExtension('WEBGL_lose_context');
          if (loseExt) loseExt.loseContext();
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
        } catch (err) {
          console.warn('Cleanup error:', err);
        }
      };
    };

    initWebGL();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isVisible, raysOrigin, raysColor, raysSpeed, lightSpread, rayLength, mouseInfluence, noiseAmount, distortion]);

  // OPTIMIZACIÓN 4: Throttle de mouse movement
  useEffect(() => {
    if (!followMouse) return;
    
    let mouseX = 0.5, mouseY = 0.5;
    let rafId;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    };

    const updateMouse = () => {
      if (rendererRef.current?.program?.uniforms) {
        rendererRef.current.program.uniforms.mousePos.value = [mouseX, mouseY];
      }
      rafId = requestAnimationFrame(updateMouse);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateMouse);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [followMouse]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full pointer-events-none overflow-hidden ${className}`}
    />
  );
};

export default LightRays;