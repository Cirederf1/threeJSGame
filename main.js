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
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as GUI from "lil-gui";

let scene, camera, renderer;

let raycaster = new Raycaster();
let mouse = new Vector2();

// Créer une nouvelle instance de GUI
let gui = new GUI.GUI({ autoPlace: false });
document.getElementById("gui").appendChild(gui.domElement);

// Créer un objet pour stocker les données de l'interface utilisateur
let uiData = {
  ARGENT: 0,
  lol: "test",
  switch: false,
  usine: {
    nom: "Usine",
    nombre: 0,
    prix: 10,
    buy: () => {
      if (uiData.ARGENT >= uiData.usine.prix) {
        uiData.ARGENT -= uiData.usine.prix;
        uiData.usine.nombre++;
        uiData.usine.prix = uiData.usine.prix * 2;
      }
    },
  },
};

let isJumping = false;
let jumpSpeed = 0.05;
let gravity = -0.005;

const keyboard = {};
const Objects = new Map();
const clock = new Clock();

const init = () => {
  scene = new Scene();
  const aspect = window.innerWidth / window.innerHeight;
  camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 4;
  camera.position.y = 1;
  camera.position.x = -0.5;
  camera.lookAt(new Vector3(-0.5, -0.5, -0.5));

  renderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshNormalMaterial();
  const cube = new Mesh(geometry, material);

  cube.position.set(-0.5, -0.5, -0.5);

  const group = new Group();
  group.add(cube);

  scene.add(group);
  Objects.set("cube", group);

  document.addEventListener("click", onMouseClick);

  // Ajouter un contrôleur pour le compteur
  gui.add(uiData, "ARGENT").listen();
  gui.add(uiData, "lol").listen();
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

  renderer.render(scene, camera);
};

function onMouseClick(event) {
  // Convertir les coordonnées de la souris en coordonnées normalisées (-1 à +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Mettre à jour le raycaster avec la position de la caméra et la direction de la souris
  raycaster.setFromCamera(mouse, camera);

  // Obtenir les objets de la scène qui intersectent le rayon
  let intersects = raycaster.intersectObjects(
    Objects.get("cube").children,
    true
  );

  for (let i = 0; i < intersects.length; i++) {
    // Si le cube est cliqué, le faire "sauter"
    if (intersects[i].object === Objects.get("cube").children[0]) {
      isJumping = true;
      uiData.ARGENT++;
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
