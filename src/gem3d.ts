import * as THREE from 'three'

export const gemHexColors = {
  ruby: 0xff4778,
  sapphire: 0x35b7ff,
  emerald: 0x35d991,
  amethyst: 0xa968ff,
  citrine: 0xffcb3d,
}

export function createDiamondGeometry(radius = 1, height = 2.1, segments = 10) {
  const positions: number[] = []
  const topY = height * 0.42
  const tableY = height * 0.32
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
    triangle([0, topY, 0], tableA, tableB)
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
    emissive: new THREE.Color(color).multiplyScalar(0.08),
    metalness: 0.08,
    roughness: rough ? 0.35 : 0.06,
    transmission: rough ? 0.28 : 0.72,
    thickness: 1.1,
    ior: 2.2,
    transparent: true,
    opacity: 0.96,
    side: THREE.DoubleSide,
    flatShading: true,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  })
}

function addGemLights(scene: THREE.Scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 2.2))
  const key = new THREE.PointLight(0xffffff, 20, 20)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const pink = new THREE.PointLight(0xff7dc8, 14, 18)
  pink.position.set(4, 1, 2)
  scene.add(pink)
  const cyan = new THREE.PointLight(0x65e8ff, 12, 18)
  cyan.position.set(-4, -2, 1)
  scene.add(cyan)
}

export function renderGemTexture(color: number, size = 192) {
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

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
  camera.position.set(0, 0.1, 5)
  addGemLights(scene)

  const gem = new THREE.Mesh(
    createDiamondGeometry(1, 2.1, 10),
    createGemMaterial(color),
  )
  gem.rotation.set(0.18, 0.45, -0.05)
  scene.add(gem)

  const halo = new THREE.PointLight(color, 18, 8)
  halo.position.set(0, -1.5, 2)
  scene.add(halo)
  renderer.render(scene, camera)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d')?.drawImage(renderCanvas, 0, 0)

  gem.geometry.dispose()
  ;(gem.material as THREE.Material).dispose()
  renderer.dispose()
  renderer.forceContextLoss()
  return canvas
}

export function addGemLighting(scene: THREE.Scene) {
  addGemLights(scene)
}
