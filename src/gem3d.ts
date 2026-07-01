import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export const gemHexColors = {
  ruby: 0xff4778,
  sapphire: 0x35b7ff,
  emerald: 0x35d991,
  amethyst: 0xa968ff,
  citrine: 0xffcb3d,
}

export function createDiamondGeometry(radius = 1, height = 2.1, segments = 10) {
  const positions: number[] = []
  const tableY = height * 0.33
  const girdleY = 0
  const bottomY = -height * 0.58
  const tableRadius = radius * 0.42

  const point = (r: number, y: number, index: number) => {
    const angle = (index / segments) * Math.PI * 2 - Math.PI / 2
    return [Math.cos(angle) * r, y, Math.sin(angle) * r] as const
  }
  const triangle = (
    a: readonly number[],
    b: readonly number[],
    c: readonly number[],
  ) => {
    positions.push(...a, ...b, ...c)
  }

  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments
    const tableA = point(tableRadius, tableY, index)
    const tableB = point(tableRadius, tableY, next)
    const girdleA = point(radius, girdleY, index)
    const girdleB = point(radius, girdleY, next)
    triangle([0, tableY + 0.01, 0], tableB, tableA)
    triangle(tableA, girdleA, girdleB)
    triangle(tableA, girdleB, tableB)
    triangle(girdleA, [0, bottomY, 0], girdleB)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createGemMaterial(color: number, rough = false) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(color).multiplyScalar(0.035),
    metalness: 0,
    roughness: rough ? 0.18 : 0.018,
    transmission: rough ? 0.55 : 0.84,
    thickness: rough ? 1.1 : 1.55,
    ior: 2.417,
    dispersion: rough ? 0.02 : 0.12,
    attenuationColor: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.45),
    attenuationDistance: 1.2,
    specularIntensity: 1,
    specularColor: 0xffffff,
    envMapIntensity: rough ? 1.8 : 3.2,
    transparent: false,
    opacity: 1,
    side: THREE.FrontSide,
    flatShading: true,
    clearcoat: 1,
    clearcoatRoughness: 0.01,
  })
}

export function createGemCoreMaterial(color: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(color).multiplyScalar(0.16),
    emissiveIntensity: 1.25,
    metalness: 0,
    roughness: 0.08,
    transmission: 0.22,
    thickness: 0.55,
    ior: 1.8,
    transparent: true,
    opacity: 0.72,
    flatShading: true,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    envMapIntensity: 2.2,
  })
}

function addGemLights(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 1.35))
  const key = new THREE.PointLight(0xffffff, 34, 20)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const pink = new THREE.PointLight(0xff7dc8, 24, 18)
  pink.position.set(4, 1, 2)
  scene.add(pink)
  const cyan = new THREE.PointLight(0x65e8ff, 20, 18)
  cyan.position.set(-4, -2, 1)
  scene.add(cyan)
}

export function addCrystalEnvironment(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
) {
  const generator = new THREE.PMREMGenerator(renderer)
  const environment = generator.fromScene(new RoomEnvironment(), 0.05).texture
  scene.environment = environment
  generator.dispose()
  return environment
}

function createTextureRenderer(size: number) {
  const renderCanvas = document.createElement('canvas')
  renderCanvas.width = size
  renderCanvas.height = size
  const renderer = new THREE.WebGLRenderer({
    canvas: renderCanvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  })
  renderer.setPixelRatio(1)
  renderer.setSize(size, size, false)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.3
  return { renderCanvas, renderer }
}

function finishTexture(
  size: number,
  renderCanvas: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  environment: THREE.Texture,
) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d')?.drawImage(renderCanvas, 0, 0)
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material]
    materials.forEach((material) => material.dispose())
  })
  environment.dispose()
  renderer.dispose()
  renderer.forceContextLoss()
  return canvas
}

export function renderGemTexture(color: number, size = 192) {
  const { renderCanvas, renderer } = createTextureRenderer(size)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0.1, 5)
  addGemLights(scene)
  const environment = addCrystalEnvironment(scene, renderer)

  const gem = new THREE.Mesh(
    createDiamondGeometry(1, 2.1, 10),
    createGemMaterial(color),
  )
  gem.add(
    new THREE.Mesh(
      createDiamondGeometry(0.7, 1.48, 10),
      createGemCoreMaterial(color),
    ),
  )
  gem.rotation.set(0.18, 0.45, -0.05)
  scene.add(gem)

  const halo = new THREE.PointLight(color, 18, 8)
  halo.position.set(0, -1.5, 2)
  scene.add(halo)
  renderer.render(scene, camera)
  return finishTexture(size, renderCanvas, renderer, scene, environment)
}

export function renderOreTexture(size = 192) {
  const { renderCanvas, renderer } = createTextureRenderer(size)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
  camera.position.set(0, 0.15, 5)
  addGemLights(scene)
  const environment = addCrystalEnvironment(scene, renderer)

  const ore = new THREE.Group()
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b738f,
    emissive: 0x281a31,
    emissiveIntensity: 0.45,
    roughness: 0.62,
    metalness: 0.26,
    envMapIntensity: 1.1,
    flatShading: true,
  })
  ;[
    [-0.48, -0.12, 0.08, 0.92],
    [0.35, -0.2, 0, 1.08],
    [0.02, 0.42, -0.12, 0.8],
  ].forEach(([x, y, z, scale], index) => {
    const piece = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.76, 0),
      rockMaterial.clone(),
    )
    piece.position.set(x, y, z)
    piece.scale.setScalar(scale)
    piece.rotation.set(index * 0.7, index * 0.45, index * 0.9)
    ore.add(piece)
  })
  const crystalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc879ff,
    emissive: 0x6c26a5,
    emissiveIntensity: 1.5,
    roughness: 0.08,
    metalness: 0.05,
    transmission: 0.45,
    thickness: 0.6,
    clearcoat: 1,
  })
  for (let index = 0; index < 5; index += 1) {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2 + index * 0.025, 0),
      crystalMaterial.clone(),
    )
    crystal.position.set(-0.62 + index * 0.3, 0.28 - Math.abs(index - 2) * 0.09, 0.68)
    crystal.scale.y = 1.7
    ore.add(crystal)
  }
  ore.rotation.set(-0.14, 0.38, 0.03)
  scene.add(ore)
  renderer.render(scene, camera)
  return finishTexture(size, renderCanvas, renderer, scene, environment)
}

export function renderChestTexture(size = 220) {
  const { renderCanvas, renderer } = createTextureRenderer(size)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0.25, 5.4)
  addGemLights(scene)
  const environment = addCrystalEnvironment(scene, renderer)

  const chest = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({
    color: 0xc05582,
    emissive: 0x3b1428,
    emissiveIntensity: 0.35,
    roughness: 0.26,
    metalness: 0.08,
    envMapIntensity: 1.4,
  })
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xffd56c,
    roughness: 0.12,
    metalness: 0.88,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 2.2,
  })
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.15, 1.45), wood)
  base.position.y = -0.38
  chest.add(base)
  const lid = new THREE.Mesh(new THREE.CapsuleGeometry(0.72, 0.95, 6, 12), wood.clone())
  lid.rotation.z = Math.PI / 2
  lid.scale.set(1, 1.18, 1)
  lid.position.y = 0.45
  chest.add(lid)
  ;[-0.74, 0, 0.74].forEach((x) => {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.85, 1.55), gold.clone())
    band.position.set(x, 0.05, 0)
    chest.add(band)
  })
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.18), gold.clone())
  lock.position.set(0, -0.22, 0.82)
  chest.add(lock)
  const jewel = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.16, 0),
    createGemMaterial(0x5ce5ff),
  )
  jewel.position.set(0, -0.2, 0.94)
  chest.add(jewel)
  chest.rotation.set(-0.12, 0.42, 0)
  scene.add(chest)
  const glow = new THREE.PointLight(0xffe493, 22, 8)
  glow.position.set(0, 0.3, 2)
  scene.add(glow)
  renderer.render(scene, camera)
  return finishTexture(size, renderCanvas, renderer, scene, environment)
}

export function addGemLighting(scene: THREE.Scene) {
  addGemLights(scene)
}
