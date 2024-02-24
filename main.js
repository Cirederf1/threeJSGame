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
  SphereGeometry,
  MeshBasicMaterial,
  Object3D,
  DirectionalLightHelper,
  HemisphereLight,
  HemisphereLightHelper,
  DirectionalLight,
  MeshLambertMaterial,
  AxesHelper,
  AnimationMixer,
  Matrix4,
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as GUI from "lil-gui";

let argent = JSON.parse(localStorage.getItem("argent")) || 0;
let nombreChats = JSON.parse(localStorage.getItem("nombreChats")) || 0;
let prixChats = JSON.parse(localStorage.getItem("prixChats")) || 5;

let nombreChiens = JSON.parse(localStorage.getItem("nombreChiens")) || 0;
let prixChiens = JSON.parse(localStorage.getItem("prixChiens")) || 5;

let scene, camera, renderer;

let raycaster = new Raycaster();
let mouse = new Vector2();

const Objects = new Map();
const Orbits = new Map();

let mixers = [];

// Créer une nouvelle instance de GUI
let gui = new GUI.GUI({ autoPlace: false });
document.getElementById("gui").appendChild(gui.domElement);

// Créer un objet pour stocker les données de l'interface utilisateur
let uiData = {
  argent: argent,
  chat: {
    nom: "Chat",
    nombre: nombreChats,
    prix: prixChats,
    buy: () => {
      if (uiData.argent >= uiData.chat.prix) {
        uiData.argent -= uiData.chat.prix;
        uiData.chat.nombre++;
        uiData.chat.prix = Math.ceil(uiData.chat.prix * 1.15);
        son_buy();
        addAnimals("cat");
        updateLocalStorage();
      }
      if (
        uiData.chat.nombre >= 10 &&
        !gui.folders.some((folder) => folder._title === "Chien")
      ) {
        addDogFolder();
      }
    },
  },
  chien: {
    nom: "Chien",
    nombre: nombreChiens,
    prix: prixChiens,
    buy: () => {
      if (uiData.argent >= uiData.chien.prix) {
        uiData.argent -= uiData.chien.prix;
        uiData.chien.nombre++;
        uiData.chien.prix = Math.ceil(uiData.chien.prix * 1.15);
        son_buy();
        addAnimals("dog");
        updateLocalStorage();
      }
    },
  },
};

console.log(gui.folders);

let isJumping = false;
let jumpSpeed = 0.05;
let gravity = -0.005;

const clock = new Clock();

const init = () => {
  // Add event listener to quest button
  const questButton = document.getElementById("questButton");
  const questWindow = document.getElementById("questWindow");
  questButton.addEventListener("click", () => {
    questWindow.classList.toggle("hidden");
  });

  // Add event listener to close button
  const closeButton = document.getElementById("closeButton");
  closeButton.addEventListener("click", () => {
    questWindow.classList.add("hidden");
  });

  scene = new Scene();
  const aspect = window.innerWidth / window.innerHeight;

  //////////////////////// LIGHTS //////////////////////////

  const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 2);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  const hemiLightHelper = new HemisphereLightHelper(hemiLight, 10);
  scene.add(hemiLightHelper);

  const dirLight = new DirectionalLight(0xffffff, 3);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(15);
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

  //////////////////////////////////////////////////////////

  camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 10;
  camera.position.y = 10;

  renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Ajouter des contrôles pour déplacer la caméra //
  const controls = new OrbitControls(camera, renderer.domElement);
  //////////////////////////////////////////////////////////

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshNormalMaterial();
  const cube = new Mesh(geometry, material);
  cube.position.y = 5.5;

  const sphereGeometry = new SphereGeometry(5, 100, 100);
  const sphereMaterial = new MeshLambertMaterial({ color: "green" });
  // sphereMaterial.wireframe = true;
  const sphereMesh = new Mesh(sphereGeometry, sphereMaterial);

  sphereMesh.receiveShadow = true;
  scene.add(sphereMesh);

  const axes = new AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  sphereMesh.add(axes);

  Orbits.set("circle1", sphereMesh);
  Objects.set("circle1", new Array());

  cube.castShadow = true;
  cube.receiveShadow = true;

  scene.add(cube);
  Objects.set("cube", cube);

  // Evenement de clique sur le cube principal
  document.addEventListener("click", onMouseClick);

  // Ajouter un contrôleur pour le compteur
  gui.add(uiData, "argent").listen();
  let chatFolder = gui.addFolder("Chat");

  // Ajouter les propriétés de 'chat' au dossier
  chatFolder.add(uiData.chat, "nom");
  chatFolder.add(uiData.chat, "nombre").listen();
  chatFolder.add(uiData.chat, "prix").listen();
  chatFolder.add(uiData.chat, "buy");

  // Au rédémarrage, ajouter les chats qui ont été achetés
  for (let i = 0; i < nombreChats; i++) {
    addAnimals("cat");
  }

  if (
    uiData.chat.nombre >= 10 &&
    !gui.folders.some((folder) => folder._title === "Chien")
  ) {
    addDogFolder();
  }

  // Au rédémarrage, ajouter les chats qui ont été achetés
  for (let i = 0; i < nombreChiens; i++) {
    addAnimals("dog");
  }
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
    if (Objects.get("cube").position.y <= 5.5) {
      Objects.get("cube").position.y = 5.5;
      isJumping = false;
      jumpSpeed = 0.05;
    }
  }

  // Initialize direction for each cat
  for (let object of Objects.get("circle1")) {
    animalMovement(object, elapsed);
  }

  // Nécessaire pour les animations
  for (let i = 0; i < mixers.length; i++) {
    mixers[i].update(delta);
  }

  renderer.render(scene, camera);
};

setInterval(() => {
  for (let object of Objects.get("circle1")) {
    uiData.argent++;
    updateLocalStorage();
  }
}, 1000);

init();
animation();

function addDogFolder() {
  let chienFolder = gui.addFolder("Chien");

  // Ajouter les propriétés de 'chat' au dossier
  chienFolder.add(uiData.chien, "nom");
  chienFolder.add(uiData.chien, "nombre").listen();
  chienFolder.add(uiData.chien, "prix").listen();
  chienFolder.add(uiData.chien, "buy");
}

window.addEventListener("resize", onWindowResize, false);

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
      uiData.argent++;
      updateLocalStorage();
      son_jump();
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateLocalStorage() {
  localStorage.setItem("argent", JSON.stringify(uiData.argent));
  localStorage.setItem("nombreChats", JSON.stringify(uiData.chat.nombre));
  localStorage.setItem("prixChats", JSON.stringify(uiData.chat.prix));
  localStorage.setItem("nombreChiens", JSON.stringify(uiData.chien.nombre));
  localStorage.setItem("prixChiens", JSON.stringify(uiData.chien.prix));
}

function addAnimals(animalType) {
  const loader = new GLTFLoader();
  let model = animalType + ".glb";
  loader.setPath("assets/models/").load(
    model,
    function (gltf) {
      const animal = gltf.scene;
      const s = 0.35;
      animal.scale.set(s, s, s);

      animal.castShadow = true;
      animal.receiveShadow = true;

      Orbits.get("circle1").add(animal);
      Objects.get("circle1").push({
        object: animal,
        phi: -Math.random(),
        chi: -Math.random(),
      });

      // Ajouter des axes pour voir la direction des chats  //
      const axes = new AxesHelper();
      axes.material.depthTest = false;
      axes.renderOrder = 1;
      animal.add(axes);
      //////////////////////////////////////////////////////////

      const mixer = new AnimationMixer(animal);
      mixer.clipAction(gltf.animations[7]).play();
      mixers.push(mixer);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function animalMovement(object, elapsed) {
  let x = 5 * Math.cos(elapsed * object.phi) * Math.sin(elapsed * object.chi);
  let y = 5 * Math.sin(elapsed * object.phi);
  let z = 5 * Math.cos(elapsed * object.phi) * Math.cos(elapsed * object.chi);
  let position = new Vector3(x, y, z);
  position.normalize().multiplyScalar(5);

  let previousPosition = object.object.position.clone();
  object.object.position.set(position.x, position.y, position.z);

  // Calculate the direction of movement
  let direction = new Vector3()
    .subVectors(position, previousPosition)
    .add(position);
  direction.sub(position).normalize();

  // Right vector
  let right = new Vector3(
    Math.sin(elapsed * object.chi - Math.PI / 2),
    0,
    Math.cos(elapsed * object.chi - Math.PI / 2)
  );

  // Up vector
  let up = new Vector3().crossVectors(right, direction);
  object.object.lookAt(direction);
  object.object.up.copy(up);
  object.object.quaternion.setFromRotationMatrix(
    new Matrix4().lookAt(direction, new Vector3(0, 0, 0), up)
  );
}
