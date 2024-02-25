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
  TextureLoader,
  BackSide,
} from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import * as GUI from "lil-gui";

//////////////////////// ACHIEVEMENTS ////////////////////////
let questNames = [
  "Cliquer sur le cube 10 fois",
  "Cliquer sur le cube 100 fois",
  "Cliquer sur le cube 1000 fois",
  "Acheter 10 chats",
  "Acheter 100 chats",
  "Acheter 500 chats",
  "Acheter 10 ratons",
  "Acheter 100 ratons",
  "Acheter 500 ratons",
  "Acheter 10 chiens",
  "Acheter 100 chiens",
  "Acheter 500 chiens",
  "Acheter 10 chevaux",
  "Acheter 100 chevaux",
  "Acheter 500 chevaux",
  "Acheter 10 loups",
  "Acheter 100 loups",
  "Acheter 500 loups",
];

//////////////////////// VARIABLES LOCALSTORAGE ////////////////////////
for (let questName of questNames) {
  if (!localStorage.getItem(questName)) {
    localStorage.setItem(questName, "false");
  }
}
let clickCount = JSON.parse(localStorage.getItem("nombreClicks")) || 0;
let argent = JSON.parse(localStorage.getItem("argent")) || 0;

let nombreChats = JSON.parse(localStorage.getItem("nombreChats")) || 0;
let prixChats = JSON.parse(localStorage.getItem("prixChats")) || 5;

let nombreRatons = JSON.parse(localStorage.getItem("nombreRatons")) || 0;
let prixRatons = JSON.parse(localStorage.getItem("prixRatons")) || 250;

let nombreChiens = JSON.parse(localStorage.getItem("nombreChiens")) || 0;
let prixChiens = JSON.parse(localStorage.getItem("prixChiens")) || 5000;

let nombreChevaux = JSON.parse(localStorage.getItem("nombreChevaux")) || 0;
let prixChevaux = JSON.parse(localStorage.getItem("prixChevaux")) || 25000;

let nombreLoups = JSON.parse(localStorage.getItem("nombreLoups")) || 0;
let prixLoups = JSON.parse(localStorage.getItem("prixLoups")) || 500000;

//////////////////////// VARIABLES GLOBALES /////////////////////////////////////////
let scene, camera, renderer;

let raycaster = new Raycaster();
let mouse = new Vector2();

const clock = new Clock();

//////////////////////// MAP DES ARRAYS CONTENANT LES OBJETS ////////////////////////
const Objects = new Map();
//////////////////////// MAP DES PLANETES ///////////////////////////////////////////
const Orbits = new Map();
//////////////////////// LISTE DES ANIMATIONS ///////////////////////////////////////
let mixers = [];
//////////////////////// INTERFACE UTILISATEUR ///////////////////////////////////////
export let gui = new GUI.GUI({ autoPlace: false });
document.getElementById("gui").appendChild(gui.domElement);

//////////////////////// DONNEES DE L'INTERFACE ///////////////////////////////////////
export let uiData = {
  Argent: argent,
  chat: {
    nombre: nombreChats,
    prix: prixChats,
    buy: () => {
      if (uiData.Argent >= uiData.chat.prix) {
        uiData.Argent -= uiData.chat.prix;
        uiData.chat.nombre++;
        uiData.chat.prix = Math.ceil(uiData.chat.prix * 1.15);
        son_collide();
        addAnimals("cat");
        updateLocalStorage();
      }
      if (
        uiData.chat.nombre >= 10 &&
        !gui.folders.some((folder) => folder._title === "Raton")
      ) {
        addRaccoonFolder(gui, uiData);
        createPlanet("#9b7653", new Vector3(10, 0, 10), "raccoon");
      }
      if (uiData.chat.nombre >= 10) {
        completeQuest("Acheter 10 chats");
      }
      if (uiData.chat.nombre >= 100) {
        completeQuest("Acheter 100 chats");
      }
      if (uiData.chat.nombre >= 500) {
        completeQuest("Acheter 500 chats");
      }
    },
  },
  raton: {
    nombre: nombreRatons,
    prix: prixRatons,
    buy: () => {
      if (uiData.Argent >= uiData.raton.prix) {
        uiData.Argent -= uiData.raton.prix;
        uiData.raton.nombre++;
        uiData.raton.prix = Math.ceil(uiData.raton.prix * 1.15);
        son_collide();
        addAnimals("raccoon");
        updateLocalStorage();
      }
      if (
        uiData.raton.nombre >= 10 &&
        !gui.folders.some((folder) => folder._title === "Chien")
      ) {
        addDogFolder(gui, uiData);
        createPlanet("#3D4849", new Vector3(10, 0, -10), "dog");
      }
      if (uiData.raton.nombre >= 10) {
        completeQuest("Acheter 10 ratons");
      }
      if (uiData.raton.nombre >= 100) {
        completeQuest("Acheter 100 ratons");
      }
      if (uiData.raton.nombre >= 500) {
        completeQuest("Acheter 500 ratons");
      }
    },
  },
  chien: {
    nombre: nombreChiens,
    prix: prixChiens,
    buy: () => {
      if (uiData.Argent >= uiData.chien.prix) {
        uiData.Argent -= uiData.chien.prix;
        uiData.chien.nombre++;
        uiData.chien.prix = Math.ceil(uiData.chien.prix * 1.15);
        son_collide();
        addAnimals("dog");
        updateLocalStorage();
      }
      if (
        uiData.chien.nombre >= 10 &&
        !gui.folders.some((folder) => folder._title === "Cheval")
      ) {
        addHorseFolder(gui, uiData);
        createPlanet("#136d15", new Vector3(-10, 0, -10), "horse");
      }
      if (uiData.chien.nombre >= 10) {
        completeQuest("Acheter 10 chiens");
      }
      if (uiData.chien.nombre >= 100) {
        completeQuest("Acheter 100 chiens");
      }
      if (uiData.chien.nombre >= 500) {
        completeQuest("Acheter 500 chiens");
      }
    },
  },
  cheval: {
    nombre: nombreChevaux,
    prix: prixChevaux,
    buy: () => {
      if (uiData.Argent >= uiData.cheval.prix) {
        uiData.Argent -= uiData.cheval.prix;
        uiData.cheval.nombre++;
        uiData.cheval.prix = Math.ceil(uiData.cheval.prix * 1.15);
        son_collide();
        addAnimals("horse");
        updateLocalStorage();
      }
      if (
        uiData.cheval.nombre >= 10 &&
        !gui.folders.some((folder) => folder._title === "Loup")
      ) {
        addWolfFolder(gui, uiData);
        createPlanet("#FFFAFA", new Vector3(-10, 0, 10), "wolf");
      }
      if (uiData.cheval.nombre >= 10) {
        completeQuest("Acheter 10 chevaux");
      }
      if (uiData.cheval.nombre >= 100) {
        completeQuest("Acheter 100 chevaux");
      }
      if (uiData.cheval.nombre >= 500) {
        completeQuest("Acheter 500 chevaux");
      }
    },
  },
  loup: {
    nombre: nombreLoups,
    prix: prixLoups,
    buy: () => {
      if (uiData.Argent >= uiData.loup.prix) {
        uiData.Argent -= uiData.loup.prix;
        uiData.loup.nombre++;
        uiData.loup.prix = Math.ceil(uiData.loup.prix * 1.15);
        son_collide();
        addAnimals("wolf");
        updateLocalStorage();
      }
      if (uiData.loup.nombre >= 10) {
        completeQuest("Acheter 10 loups");
      }
      if (uiData.loup.nombre >= 100) {
        completeQuest("Acheter 100 loups");
      }
      if (uiData.loup.nombre >= 500) {
        completeQuest("Acheter 500 loups");
      }
    },
  },
};

//////////////////////// ATTRIBUT CUBE ///////////////////////////////////////
let isJumping = false;
let jumpSpeed = 0.05;
let gravity = -0.005;

//////////////////////// INITIALISATION ///////////////////////////////////////
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

  // Initialise les quêtes
  const questList = document.getElementById("questList");
  // Créer une Map avec les noms des quêtes et leur statut de complétion
  let quests = new Map(
    questNames.map((questName) => [
      questName,
      localStorage.getItem(questName) === "true",
    ])
  );
  // Ajouter toutes les quêtes à questList
  for (let [questName, isCompleted] of quests) {
    // Créer un nouvel élément de liste
    let listItem = document.createElement("li");
    listItem.className = "quest-item";

    // Créer une nouvelle case à cocher
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted;
    checkbox.className = "quest-checkbox";
    checkbox.id = questName;

    // Ajouter le nom de la quête et la case à cocher à l'élément de la liste
    listItem.appendChild(document.createTextNode(questName));
    listItem.appendChild(checkbox);

    // Ajouter l'élément de la liste à questList
    questList.appendChild(listItem);
  }

  // Initialise la scène
  scene = new Scene();
  const aspect = window.innerWidth / window.innerHeight;

  //////////////////////// SPACE BACKGROUND //////////////////////////
  const loader = new TextureLoader();
  const texture = loader.load("assets/img/space2.jpg");

  const sphereGeometrySpace = new SphereGeometry(500, 32, 32);
  const sphereMaterialSpace = new MeshBasicMaterial({
    map: texture,
    side: BackSide,
  });
  const sphereMeshSpace = new Mesh(sphereGeometrySpace, sphereMaterialSpace);
  scene.add(sphereMeshSpace);

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

  /////////////////////////  CAMERA /////////////////////////////////
  camera = new PerspectiveCamera(100, aspect, 0.1, 100000);
  camera.position.z = 20;
  camera.position.y = 10;
  ///////////////////////////////////////////////////////////////////
  renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize, false);

  //////// Ajouter des contrôles pour déplacer la caméra /////////
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  //////////////////////// CUBE /////////////////////////
  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshNormalMaterial();
  const cube = new Mesh(geometry, material);
  cube.position.y = 5.5;
  cube.castShadow = true;
  cube.receiveShadow = true;

  scene.add(cube);
  Objects.set("cube", cube);

  // Evenement de clique sur le cube principal
  document.addEventListener("click", onMouseClick);

  //////////////////////// PLANETES /////////////////////////
  const planetChat = createPlanet("#c8ad7f", new Vector3(0, 0, 0), "cat");

  // Ajouter un contrôleur pour le compteur
  gui.add(uiData, "Argent").listen();
  addCatFolder(gui, uiData);

  // Au rédémarrage, ajouter les chats qui ont été achetés
  for (let i = 0; i < nombreChats; i++) {
    addAnimals("cat");
  }

  // Au rédémarrage, ajouter les ratons qui ont été achetés
  if (
    uiData.chat.nombre >= 10 &&
    !gui.folders.some((folder) => folder._title === "Raton")
  ) {
    addRaccoonFolder(gui, uiData);
    const planetRaton = createPlanet(
      "#9b7653",
      new Vector3(10, 0, 10),
      "raccoon"
    );
  }
  for (let i = 0; i < nombreRatons; i++) {
    addAnimals("raccoon");
  }

  // Au rédémarrage, ajouter les chiens qui ont été achetés
  if (
    uiData.raton.nombre >= 10 &&
    !gui.folders.some((folder) => folder._title === "Chien")
  ) {
    addDogFolder(gui, uiData);
    const planetChien = createPlanet("#3D4849", new Vector3(10, 0, -10), "dog");
  }
  for (let i = 0; i < nombreChiens; i++) {
    addAnimals("dog");
  }

  // Au rédémarrage, ajouter les chevaux qui ont été achetés
  if (
    uiData.chien.nombre >= 10 &&
    !gui.folders.some((folder) => folder._title === "Cheval")
  ) {
    addHorseFolder(gui, uiData);
    const planetCheval = createPlanet(
      "#136d15",
      new Vector3(-10, 0, -10),
      "horse"
    );
  }
  for (let i = 0; i < nombreChevaux; i++) {
    addAnimals("horse");
  }

  // Au rédémarrage, ajouter les loups qui ont été achetés
  if (
    uiData.cheval.nombre >= 10 &&
    !gui.folders.some((folder) => folder._title === "Loup")
  ) {
    addWolfFolder(gui, uiData);
    const planetLoup = createPlanet("#FFFAFA", new Vector3(-10, 0, 10), "wolf");
  }
  for (let i = 0; i < nombreLoups; i++) {
    addAnimals("wolf");
  }
};

init();

/////////////////////////////////////// LOOP ///////////////////////////////////////
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

  // Apply animalMovement to each cat
  Objects.get("cat").forEach((object) => {
    animalMovement(object, elapsed);
  });

  // Apply animalMovement to each raccoon
  if (gui.folders.some((folder) => folder._title === "Raton")) {
    Objects.get("raccoon").forEach((object) => {
      animalMovement(object, elapsed);
    });
  }
  // Apply animalMovement to each dog
  if (gui.folders.some((folder) => folder._title === "Chien")) {
    Objects.get("dog").forEach((object) => {
      animalMovement(object, elapsed);
    });
  }
  // Apply animalMovement to each horse
  if (gui.folders.some((folder) => folder._title === "Cheval")) {
    Objects.get("horse").forEach((object) => {
      animalMovement(object, elapsed);
    });
  }
  // Apply animalMovement to each wolf
  if (gui.folders.some((folder) => folder._title === "Loup")) {
    Objects.get("wolf").forEach((object) => {
      animalMovement(object, elapsed);
    });
  }

  // Nécessaire pour les animations
  for (let i = 0; i < mixers.length; i++) {
    mixers[i].update(delta);
  }

  renderer.render(scene, camera);
};

animation();

///////////////////////// UPDATE DE L'ARGENT ///////////////////////////////////////
setInterval(() => {
  uiData.Argent +=
    uiData.chat.nombre *
    (localStorage.getItem("Acheter 10 chats") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 100 chats") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 500 chats") === "true" ? 2 : 1);
  uiData.Argent +=
    uiData.raton.nombre *
    10 *
    (localStorage.getItem("Acheter 10 ratons") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 100 ratons") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 500 ratons") === "true" ? 2 : 1);
  uiData.Argent +=
    uiData.chien.nombre *
    50 *
    (localStorage.getItem("Acheter 10 chiens") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 100 chiens") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 500 chiens") === "true" ? 2 : 1);
  uiData.Argent +=
    uiData.cheval.nombre *
    250 *
    (localStorage.getItem("Acheter 10 chevaux") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 100 chevaux") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 500 chevaux") === "true" ? 2 : 1);
  uiData.Argent +=
    uiData.loup.nombre *
    2000 *
    (localStorage.getItem("Acheter 10 loups") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 100 loups") === "true" ? 2 : 1) *
    (localStorage.getItem("Acheter 500 loups") === "true" ? 2 : 1);
  updateLocalStorage();
}, 1000);

///////////////////////// FONCTIONS ///////////////////////////////////////
// Fonction de click sur le cube
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
      uiData.Argent +=
        1 *
        (localStorage.getItem("Cliquer sur le cube 10 fois") === "true"
          ? 2
          : 1) *
        (localStorage.getItem("Cliquer sur le cube 100 fois") === "true"
          ? 2
          : 1) *
        (localStorage.getItem("Cliquer sur le cube 1000 fois") === "true"
          ? 2
          : 1);
      clickCount++;
      updateLocalStorage();
      son_jump();

      //////////////////////// ACHIEVEMENTS ////////////////////////
      if (clickCount >= 10) {
        completeQuest("Cliquer sur le cube 10 fois");
      }

      if (clickCount >= 100) {
        completeQuest("Cliquer sur le cube 100 fois");
      }

      if (clickCount >= 1000) {
        completeQuest("Cliquer sur le cube 1000 fois");
      }
      //////////////////////////////////////////////////////////////
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Fonction pour mettre à jour le local storage
function updateLocalStorage() {
  localStorage.setItem("nombreClicks", JSON.stringify(clickCount));
  localStorage.setItem("argent", JSON.stringify(uiData.Argent));
  localStorage.setItem("nombreChats", JSON.stringify(uiData.chat.nombre));
  localStorage.setItem("prixChats", JSON.stringify(uiData.chat.prix));
  localStorage.setItem("nombreRatons", JSON.stringify(uiData.raton.nombre));
  localStorage.setItem("prixRatons", JSON.stringify(uiData.raton.prix));
  localStorage.setItem("nombreChiens", JSON.stringify(uiData.chien.nombre));
  localStorage.setItem("prixChiens", JSON.stringify(uiData.chien.prix));
  localStorage.setItem("nombreChevaux", JSON.stringify(uiData.cheval.nombre));
  localStorage.setItem("prixChevaux", JSON.stringify(uiData.cheval.prix));
  localStorage.setItem("nombreLoups", JSON.stringify(uiData.loup.nombre));
  localStorage.setItem("prixLoups", JSON.stringify(uiData.loup.prix));
}

// Fonction pour ajouter des animaux
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

      Orbits.get(animalType).add(animal);
      Objects.get(animalType).push({
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

// Fonction pour faire bouger les animaux
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

// Fonction pour créer une planète
function createPlanet(color, position, animal) {
  son_planet();
  const geometry = new SphereGeometry(5, 100, 100);
  const material = new MeshLambertMaterial({ color: color });
  // material.wireframe = true;

  const planet = new Mesh(geometry, material);

  planet.receiveShadow = true;
  planet.position.set(position.x, position.y, position.z);
  scene.add(planet);

  const axes = new AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  planet.add(axes);

  Orbits.set(animal, planet);
  Objects.set(animal, new Array());

  return planet;
}

// Fonction pour la complétion des quêtes
function completeQuest(questName) {
  localStorage.setItem(questName, "true");
  let checkbox = document.getElementById(questName);
  if (checkbox) {
    checkbox.checked = true;
  }
}
