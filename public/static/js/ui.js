export class UI {
  constructor(uiRoot, maxHP) {
    this.uiRoot = uiRoot;
    this.maxHP = maxHP;
    this.hearts = [];

    this.init();
  }

  init() {
    this.characterNode = this.uiRoot.querySelector("#ui-character");
    this.hpNode = this.uiRoot.querySelector("#ui-hp");
    this.skillIssueNode = this.uiRoot.querySelector("#ui-skill-issue");

    const characterImg = document.createElement("img");
    characterImg.src = "/static/images/ui/isaac_character.png";
    this.characterNode.appendChild(characterImg);

    for (let i = 0; i < this.maxHP; i++) {
        const heart = document.createElement("img");
        heart.src = "/static/images/ui/heart_full.png";
        this.hearts.push(heart);

        this.hpNode.appendChild(heart);
    }

    const skillIssueImg = document.createElement("img");
    skillIssueImg.src = "/static/images/ui/skill_issue.png";
    this.skillIssueNode.appendChild(skillIssueImg);
    this.skill_issue_visibility(false);
  }

  set_hp(hp) {
    for (let i = 0; i < this.maxHP; i++) {
        const heart = this.hearts[i];
        if (i < hp)
            heart.src = "/static/images/ui/heart_full.png";
        else
            heart.src = "/static/images/ui/heart_empty.png";
    }
  }

  skill_issue_visibility(visible) {
    this.skillIssueNode.style.visibility = visible ? "visible" : "hidden";
  }

  reset() {
    this.set_hp(this.maxHP);
    this.skill_issue_visibility(false);
  }
}