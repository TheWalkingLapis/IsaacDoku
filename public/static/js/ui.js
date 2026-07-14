export class UI {
  constructor(uiRoot, maxHP) {
    this.uiRoot = uiRoot;
    this.maxHP = maxHP;
    this.hearts = [];

    this.init();
  }

  init() {
    const character = this.uiRoot.querySelector("#ui-character");
    const hp = this.uiRoot.querySelector("#ui-hp");

    const characterImg = document.createElement("img");
    characterImg.src = "/static/images/ui/isaac_character.png";
    character.appendChild(characterImg);

    for (let i = 0; i < this.maxHP; i++) {
        const heart = document.createElement("img");
        heart.src = "/static/images/ui/heart_full.png";
        this.hearts.push(heart);

        hp.appendChild(heart);
    }
  }

  async set_hp(hp) {
    for (let i = 0; i < this.maxHP; i++) {
        const heart = this.hearts[i];
        if (i < hp)
            heart.src = "/static/images/ui/heart_full.png";
        else
            heart.src = "/static/images/ui/heart_empty.png";
    }
  }

  async reset() {
    this.set_hp(this.maxHP);
  }
}