import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  addCrystalEnvironment,
  addGemLighting,
  createDiamondGeometry,
  createGemCoreMaterial,
  createGemMaterial,
  gemHexColors,
} from '../gem3d'
import type { GemColor } from '../curriculum'

export type ForgeShape = 'bunny' | 'cat' | 'crown' | 'butterfly'

function gemMesh(
  geometry: THREE.BufferGeometry,
  color: number,
  scale: [number, number, number],
  position: [number, number, number],
) {
  const mesh = new THREE.Mesh(geometry, createGemMaterial(color, true))
  addCrystalLayers(mesh, geometry, color)
  mesh.scale.set(...scale)
  mesh.position.set(...position)
  return mesh
}

function addCrystalLayers(
  mesh: THREE.Mesh,
  geometry: THREE.BufferGeometry,
  color: number,
) {
  const core = new THREE.Mesh(geometry.clone(), createGemCoreMaterial(color))
  core.scale.setScalar(0.72)
  mesh.add(core)

  const facets = new THREE.Mesh(
    geometry.clone(),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  facets.scale.setScalar(1.012)
  mesh.add(facets)
}

function createSculpture(shape: ForgeShape, colors: number[]) {
  const group = new THREE.Group()
  const sphere = new THREE.IcosahedronGeometry(1, 2)
  const gem = createDiamondGeometry(1, 1.7, 8)
  const capsule = new THREE.CapsuleGeometry(0.35, 1, 4, 8)

  if (shape === 'bunny') {
    group.add(gemMesh(sphere, colors[0], [0.72, 0.9, 0.58], [0, -0.45, 0]))
    group.add(gemMesh(sphere, colors[1], [0.62, 0.58, 0.55], [0, 0.62, 0]))
    group.add(gemMesh(capsule, colors[2], [0.42, 0.72, 0.35], [-0.32, 1.55, 0]))
    group.add(gemMesh(capsule, colors[3], [0.42, 0.72, 0.35], [0.32, 1.55, 0]))
    group.add(gemMesh(sphere, colors[4], [0.26, 0.26, 0.24], [0.72, -0.58, -0.05]))
  } else if (shape === 'cat') {
    group.add(gemMesh(sphere, colors[0], [0.75, 0.92, 0.6], [0, -0.48, 0]))
    group.add(gemMesh(sphere, colors[1], [0.63, 0.6, 0.55], [0, 0.65, 0]))
    const ear = new THREE.ConeGeometry(0.38, 0.72, 6)
    group.add(gemMesh(ear, colors[2], [0.8, 1, 0.6], [-0.38, 1.36, 0]))
    group.add(gemMesh(ear, colors[3], [0.8, 1, 0.6], [0.38, 1.36, 0]))
    const tail = new THREE.TorusGeometry(0.65, 0.16, 6, 18, Math.PI * 1.4)
    const tailMesh = gemMesh(tail, colors[4], [1, 1, 1], [0.72, -0.38, 0])
    tailMesh.rotation.z = -0.8
    group.add(tailMesh)
  } else if (shape === 'crown') {
    const ring = new THREE.TorusGeometry(0.95, 0.18, 7, 20)
    const ringMesh = gemMesh(ring, colors[0], [1, 1, 1], [0, -0.48, 0])
    ringMesh.rotation.x = Math.PI / 2
    group.add(ringMesh)
    for (let index = 0; index < 5; index += 1) {
      const x = (index - 2) * 0.42
      const height = index === 2 ? 1.85 : index % 2 ? 1.45 : 1.2
      group.add(
        gemMesh(gem, colors[index % colors.length], [0.28, height * 0.42, 0.28], [x, 0.15 + height * 0.28, 0]),
      )
    }
  } else {
    group.add(gemMesh(capsule, colors[0], [0.42, 1.2, 0.42], [0, 0, 0]))
    const wing = new THREE.SphereGeometry(1, 12, 8)
    group.add(gemMesh(wing, colors[1], [0.82, 1.05, 0.24], [-0.78, 0.52, 0]))
    group.add(gemMesh(wing, colors[2], [0.82, 1.05, 0.24], [0.78, 0.52, 0]))
    group.add(gemMesh(wing, colors[3], [0.66, 0.75, 0.2], [-0.68, -0.65, 0]))
    group.add(gemMesh(wing, colors[4], [0.66, 0.75, 0.2], [0.68, -0.65, 0]))
  }

  return group
}

export function CrystalStage({
  colors,
  shape,
  progress = 100,
  className = '',
  environmentUrl,
}: {
  colors: GemColor[]
  shape?: ForgeShape
  progress?: number
  className?: string
  environmentUrl?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const host = hostRef.current
    if (!host) {
      return
    }

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.35
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(0, 0.15, 6.2)
    addGemLighting(scene)
    let environment = addCrystalEnvironment(scene, renderer)
    let disposed = false
    if (environmentUrl) {
      new THREE.TextureLoader().load(environmentUrl, (source) => {
        if (disposed) {
          source.dispose()
          return
        }
        source.colorSpace = THREE.SRGBColorSpace
        source.mapping = THREE.EquirectangularReflectionMapping
        const generator = new THREE.PMREMGenerator(renderer)
        const matchedEnvironment = generator.fromEquirectangular(source).texture
        generator.dispose()
        source.dispose()
        environment.dispose()
        environment = matchedEnvironment
        scene.environment = environment
      })
    }

    const palette = colors.map((color) => gemHexColors[color])
    const diamondGeometry = createDiamondGeometry(1.25, 2.7, 12)
    const diamond = new THREE.Mesh(
      diamondGeometry,
      createGemMaterial(palette[0] ?? gemHexColors.ruby),
    )
    addCrystalLayers(
      diamond,
      diamondGeometry,
      palette[0] ?? gemHexColors.ruby,
    )
    diamond.rotation.x = 0.16
    scene.add(diamond)

    const looseGems = new THREE.Group()
    if (!shape && palette.length > 1) {
      diamond.visible = false
      palette.forEach((color, index) => {
        const loose = new THREE.Mesh(
          createDiamondGeometry(0.55, 1.2, 10),
          createGemMaterial(color),
        )
        addCrystalLayers(loose, loose.geometry, color)
        const angle = (index / palette.length) * Math.PI * 2 - Math.PI / 2
        loose.position.set(Math.cos(angle) * 1.45, Math.sin(angle) * 1.08, 0)
        loose.rotation.set(0.2, index * 0.7, 0)
        looseGems.add(loose)
      })
      scene.add(looseGems)
    }

    const sculpture = shape
      ? createSculpture(shape, [
          ...palette,
          ...Object.values(gemHexColors),
        ].slice(0, 5))
      : null
    if (sculpture) {
      sculpture.scale.setScalar(0.95)
      sculpture.position.y = -0.2
      scene.add(sculpture)
    }

    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.7
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.45
    }
    host.addEventListener('pointermove', onPointerMove)

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    renderer.setAnimationLoop((time) => {
      const value = progressRef.current
      diamond.visible = (!shape && palette.length === 1) || Boolean(shape && value < 34)
      if (sculpture) {
        sculpture.visible = value >= 34
        const reveal = Math.min(1, (value - 30) / 70)
        sculpture.scale.setScalar(0.72 + reveal * 0.28)
        sculpture.children.forEach((child, index) => {
          child.visible = value >= 34 + index * 5
          const material = (child as THREE.Mesh)
            .material as THREE.MeshPhysicalMaterial
          material.roughness = 0.2 - reveal * 0.185
          material.transmission = 0.68 + reveal * 0.32
        material.thickness = 1.1 + reveal * 0.75
          material.dispersion = 0.06 + reveal * 0.12
          material.envMapIntensity = 2.4 + reveal * 1.6
        })
        sculpture.rotation.y = time * 0.00045 + pointer.x
        sculpture.rotation.x += (pointer.y - sculpture.rotation.x) * 0.05
      }
      diamond.rotation.y = time * 0.00055 + pointer.x
      diamond.rotation.x += (0.15 + pointer.y - diamond.rotation.x) * 0.04
      looseGems.rotation.y = time * 0.00035 + pointer.x
      looseGems.rotation.x = pointer.y * 0.4
      renderer.render(scene, camera)
    })

    return () => {
      disposed = true
      renderer.setAnimationLoop(null)
      observer.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      environment.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [colors, environmentUrl, shape])

  return <div className={`crystal-stage ${className}`} ref={hostRef} />
}
