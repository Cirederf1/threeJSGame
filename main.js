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

  // Fais bouger les chats
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

  // Les chats regardent dans la direction de leur mouvement
  for (let object of Objects.get("circle1")) {
    let rotationY = Math.atan2(object.vy, object.vx);
    object.object.rotation.y = rotationY + Math.PI / 2;
    object.object.rotation.x = Math.PI / 2;
    object.object.rotation.z = 0;
  }

  // Nécessaire pour les animations
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
      son_jump();
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
