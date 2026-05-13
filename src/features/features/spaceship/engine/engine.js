import * as THREE from 'three';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { EngineGroup } from './engineGroup.js';
import { MainEngine } from './mainEngine.js';

let scene;
let camera;
let renderer;
const canvas = document.querySelector('.webgl');
scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 50000000;



document.getElementById('dashboard').style.display = 'none'
camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 20;
scene.add(camera);
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias:true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);
const controls = new OrbitControls(camera, renderer.domElement);



  
  // یک گروه بزرگتر برای نگهداری چند آبجکت موتور
  const engineAssembly = new THREE.Group();
  scene.add(engineAssembly);
  const mainEngine = new MainEngine(scene);
  // ایجاد چند نمونه از EngineGroup و افزودن آن‌ها به engineAssembly
  const engine1 = new EngineGroup();
  const engine2 = new EngineGroup();
//   const engine3 = new EngineGroup();

  engineAssembly.add(engine1.group);
  engineAssembly.add(engine2.group);
//   engineAssembly.add(engine3.group);
// تنظیم موقعیت موتورها
engine1.group.position.set(-4, -1, 0);  // موتور 1 در سمت چپ
engine2.group.position.set(4, -1, 0);   // موتور 2 در سمت راست
// engine3.group.position.set(0, 0.5, -1.8);  // موتور 3 در عقب
  
  window.addEventListener('keydown', (e) => {
    engine1.onKeyDown(e.key);
    engine2.onKeyDown(e.key);
    mainEngine.onKeyDown(e.key);
  });
  window.addEventListener('keyup', (e) => {
    engine1.onKeyUp(e.key);
    engine2.onKeyUp(e.key);
    // engine3.onKeyUp(e.key);
    mainEngine.onKeyUp(e.key);
  });
  

// زمین با GridHelper
const gridSize = 50;
const gridDivisions = 50;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x888888);
gridHelper.position.y =  -10
scene.add(gridHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  const elapsed = performance.now() / 1000;
  // به روز رسانی آبجکت موتور
  engine1.update(elapsed);
  engine2.update(elapsed);
//   engine3.update(elapsed);
  mainEngine.update(elapsed);


  renderer.render(scene, camera);
}
animate();

// مدیریت تغییر اندازه صفحه نمایش
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});