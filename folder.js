function addCatFolder(gui, uiData) {
  let chatFolder = gui.addFolder("Chat");
  chatFolder.add(uiData.chat, "nombre").listen();
  chatFolder.add(uiData.chat, "prix").listen();
  chatFolder.add(uiData.chat, "buy");
}

function addRaccoonFolder(gui, uiData) {
  let ratonFolder = gui.addFolder("Raton");
  ratonFolder.add(uiData.raton, "nombre").listen();
  ratonFolder.add(uiData.raton, "prix").listen();
  ratonFolder.add(uiData.raton, "buy");
}

function addDogFolder(gui, uiData) {
  let chienFolder = gui.addFolder("Chien");
  chienFolder.add(uiData.chien, "nombre").listen();
  chienFolder.add(uiData.chien, "prix").listen();
  chienFolder.add(uiData.chien, "buy");
}

function addHorseFolder(gui, uiData) {
  let chevalFolder = gui.addFolder("Cheval");
  chevalFolder.add(uiData.cheval, "nombre").listen();
  chevalFolder.add(uiData.cheval, "prix").listen();
  chevalFolder.add(uiData.cheval, "buy");
}

function addWolfFolder(gui, uiData) {
  let loupFolder = gui.addFolder("Loup");
  loupFolder.add(uiData.loup, "nombre").listen();
  loupFolder.add(uiData.loup, "prix").listen();
  loupFolder.add(uiData.loup, "buy");
}
