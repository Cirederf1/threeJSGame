"use strict";

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  MeshNormalMaterial,
  AmbientLight,
  Clock,
  Group,
  Vector3,
  Vector2,
  Raycaster,
  CircleGeometry,
  MeshBasicMaterial,
  Object3D,
  DirectionalLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  DirectionalLight,
  MeshLambertMaterial,
  AxesHelper,
  AnimationMixer,
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as GUI from "lil-gui";

let zzfx, zzfxV, zzfxX;

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.2.1 by Frank Force ~ 880 bytes
zzfxV = 0.3; // volume
zzfx = // play sound
  (
    p = 1,
    k = 0.05,
    b = 220,
    e = 0,
    r = 0,
    t = 0.1,
    q = 0,
    D = 1,
    u = 0,
    y = 0,
    v = 0,
    z = 0,
    l = 0,
    E = 0,
    A = 0,
    F = 0,
    c = 0,
    w = 1,
    m = 0,
    B = 0,
    M = Math,
    R = 44100,
    d = 2 * M.PI,
    G = (u *= (500 * d) / R / R),
    C = (b *= ((1 - k + 2 * k * M.random((k = []))) * d) / R),
    g = 0,
    H = 0,
    a = 0,
    n = 1,
    I = 0,
    J = 0,
    f = 0,
    x,
    h
  ) => {
    e = R * e + 9;
    m *= R;
    r *= R;
    t *= R;
    c *= R;
    y *= (500 * d) / R ** 3;
    A *= d / R;
    v *= d / R;
    z *= R;
    l = (R * l) | 0;
    for (h = (e + m + r + t + c) | 0; a < h; k[a++] = f)
      ++J % ((100 * F) | 0) ||
        ((f = q
          ? 1 < q
            ? 2 < q
              ? 3 < q
                ? M.sin((g % d) ** 3)
                : M.max(M.min(M.tan(g), 1), -1)
              : 1 - (((((2 * g) / d) % 2) + 2) % 2)
            : 1 - 4 * M.abs(M.round(g / d) - g / d)
          : M.sin(g)),
        (f =
          (l ? 1 - B + B * M.sin((d * a) / l) : 1) *
          (0 < f ? 1 : -1) *
          M.abs(f) ** D *
          zzfxV *
          p *
          (a < e
            ? a / e
            : a < e + m
            ? 1 - ((a - e) / m) * (1 - w)
            : a < e + m + r
            ? w
            : a < h - c
            ? ((h - a - c) / t) * w
            : 0)),
        (f = c
          ? f / 2 +
            (c > a ? 0 : ((a < h - c ? 1 : (h - a) / c) * k[(a - c) | 0]) / 2)
          : f)),
        (x = (b += u += y) * M.cos(A * H++)),
        (g += x - x * E * (1 - ((1e9 * (M.sin(a) + 1)) % 2))),
        n && ++n > z && ((b += v), (C += v), (n = 0)),
        !l || ++I % l || ((b = C), (u = G), (n = n || 1));
    p = zzfxX.createBuffer(1, h, R);
    p.getChannelData(0).set(k);
    b = zzfxX.createBufferSource();
    b.buffer = p;
    b.connect(zzfxX.destination);
    b.start();
    return b;
  };
zzfxX = new AudioContext();

const son_buy = () =>
  zzfx(
    ...[
      ,
      ,
      493,
      0.01,
      0.18,
      0.3,
      2,
      1.85,
      ,
      -2.7,
      228,
      0.02,
      0.01,
      ,
      ,
      ,
      ,
      0.91,
      0.28,
    ]
  );

const son_collide = () =>
  zzfx(
    ...[
      ,
      ,
      1371,
      0.04,
      0.01,
      0.01,
      1,
      1.84,
      -43,
      ,
      148,
      0.04,
      ,
      ,
      79,
      ,
      ,
      0.52,
      0.03,
    ]
  );

let scene, camera, renderer;

let raycaster = new Raycaster();
let mouse = new Vector2();

let mixers = [];

// Créer une nouvelle instance de GUI
let gui = new GUI.GUI({ autoPlace: false });
document.getElementById("gui").appendChild(gui.domElement);

// Créer un objet pour stocker les données de l'interface utilisateur
let uiData = {
  ARGENT: 0,
  usine: {
    nom: "Usine",
    nombre: 0,
    prix: 5,
    buy: () => {
      if (uiData.ARGENT >= uiData.usine.prix) {
        uiData.ARGENT -= uiData.usine.prix;
        uiData.usine.nombre++;
        uiData.usine.prix = parseInt(uiData.usine.prix * 1.3);
        const loader = new GLTFLoader();
        son_buy();

        loader.setPath("assets/models/").load(
          "Cat.glb",
          function (gltf) {
            const chat = gltf.scene;
            const s = 0.35;
            chat.scale.set(s, s, s);
            chat.rotation.x = Math.PI / 2;

            chat.castShadow = true;
            chat.receiveShadow = true;

            Orbits.get("circle1").add(chat);
            Objects.get("circle1").push({
              object: chat,
              vx: (Math.random() - 0.5) / 10,
              vy: (Math.random() - 0.5) / 10,
            });
            // chat.lookAt(chat.position.x + vx, 0, chat.position.z + vy);

            const axes = new AxesHelper();
            axes.material.depthTest = false;
            axes.renderOrder = 1;
            chat.add(axes);

            const mixer = new AnimationMixer(chat);
            mixer.clipAction(gltf.animations[7]).play();
            mixers.push(mixer);
          },
          undefined,
          function (error) {
            console.error(error);
          }
        );
      }
    },
  },
};

let isJumping = false;
let jumpSpeed = 0.05;
let gravity = -0.005;

let vx = (Math.random() - 0.5) / 10;
let vy = (Math.random() - 0.5) / 10;

const Objects = new Map();
const Orbits = new Map();

const clock = new Clock();

const init = () => {
  scene = new Scene();
  const aspect = window.innerWidth / window.innerHeight;

  // LIGHTS

  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 2);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const hemiLightHelper = new HemisphereLightHelper(hemiLight, 10);
  scene.add(hemiLightHelper);

  //

  const dirLight = new DirectionalLight(0xffffff, 3);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(30);
  scene.add(dirLight);

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  const d = 1;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 350;

  const dirLightHelper = new DirectionalLightHelper(dirLight, 5);
  scene.add(dirLightHelper);

  //

  camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 4;
  camera.position.y = 1;

  renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshNormalMaterial();
  const cube = new Mesh(geometry, material);

  const circleOrbit = new Object3D();
  circleOrbit.rotation.x = -Math.PI / 2;
  circleOrbit.position.y = -0.5;
  scene.add(circleOrbit);

  const circleGeometry = new CircleGeometry(5, 100);
  const circleMaterial = new MeshLambertMaterial({ color: 0xffffff });
  circleMaterial.color.setHSL(0.095, 1, 0.75);
  const circleMesh = new Mesh(circleGeometry, circleMaterial);

  circleMesh.receiveShadow = true;
  circleOrbit.add(circleMesh);

  Orbits.set("circle1", circleMesh);
  Objects.set("circle1", new Array());

  cube.castShadow = true;
  cube.receiveShadow = true;

  scene.add(cube);
  Objects.set("cube", cube);

  document.addEventListener("click", onMouseClick);

  // Ajouter un contrôleur pour le compteur
  gui.add(uiData, "ARGENT").listen();
  let usineFolder = gui.addFolder("Usine");

  // Ajouter les propriétés de 'usine' au dossier
  usineFolder.add(uiData.usine, "nom");
  usineFolder.add(uiData.usine, "nombre").listen();
  usineFolder.add(uiData.usine, "prix").listen();
  usineFolder.add(uiData.usine, "buy");
};

// Main loop
const animation = () => {
  renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  if (isJumping) {
    // Si le cube est en train de sauter, augmenter sa position y
    Objects.get("cube").position.y += jumpSpeed;

    // Réduire la vitesse de saut pour simuler la gravité
    jumpSpeed += gravity;

    // Si le cube a atteint le sol, arrêter le saut
    if (Objects.get("cube").position.y <= 0) {
      Objects.get("cube").position.y = 0;
      isJumping = false;
      jumpSpeed = 0.05;
    }
  }

  for (let object of Objects.get("circle1")) {
    let nextX = object.object.position.x + object.vx;
    let nextY = object.object.position.y + object.vy;

    if (Math.sqrt(nextX * nextX + nextY * nextY) <= 5) {
      object.object.position.x = nextX;
      object.object.position.y = nextY;
    } else {
      object.vx = (Math.random() - 0.5) / 10;
      object.vy = (Math.random() - 0.5) / 10;
      son_collide();
    }
  }
  for (let object of Objects.get("circle1")) {
    let rotationY = Math.atan2(object.vy, object.vx);
    object.object.rotation.y = rotationY + Math.PI / 2;
    object.object.rotation.x = Math.PI / 2;
    object.object.rotation.z = 0;
  }

  for (let i = 0; i < mixers.length; i++) {
    mixers[i].update(delta);
  }

  renderer.render(scene, camera);
};

setInterval(() => {
  for (let object of Objects.get("circle1")) {
    uiData.ARGENT++;
  }
}, 1000);

setInterval(() => {
  for (let object of Objects.get("circle1")) {
    console.log(object.object.position);
    console.log(object.object.rotation);
  }
}, 1000);

function onMouseClick(event) {
  // Convertir les coordonnées de la souris en coordonnées normalisées (-1 à +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Mettre à jour le raycaster avec la position de la caméra et la direction de la souris
  raycaster.setFromCamera(mouse, camera);

  // Obtenir les objets de la scène qui intersectent le rayon
  let intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    // Si le cube est cliqué, le faire "sauter"
    if (intersects[i].object === Objects.get("cube")) {
      isJumping = true;
      uiData.ARGENT++;
      zzfx(
        ...[
          ,
          ,
          492,
          0.01,
          0.04,
          0.08,
          1,
          0.83,
          -25,
          -3.9,
          ,
          ,
          ,
          0.4,
          ,
          ,
          ,
          0.94,
        ]
      );
    }
  }
}

init();
animation();

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
