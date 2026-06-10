import Choices from "https://esm.sh/choices.js";

import { Item, ItemList } from "./item.js";

export class ItemSearch {
  constructor(searchNode, items, onSelect,) {
    this.searchNode = searchNode;
    this.items = items;
    this.onSelect = onSelect;
    this.choices = null;

    this.init();
  }

  init() {
    this.searchNode.innerHTML = "";

    this.choices = new Choices(this.searchNode, {
      placeholderValue: "Select an Item!",
      itemSelectText: "",
      searchResultLimit: -1,
      choices: this.items.map(item => ({
        value: item.id(),
        label: item.name(),
        customProperties: {
          image: item.img()
        }
      })),

      callbackOnCreateTemplates(strToEl) {
        return {
          choice: (classNames, data) =>
            strToEl(`
              <div
                class="choices__item choices__item--choice"
                data-choice
                data-id="${data.id}"
                data-value="${data.value}"
              >
                <img
                  class="choice-image"
                  src="${data.customProperties.image}"
                  alt=""
                >
                <span class="choice-label">
                  ${data.label}
                </span>
              </div>
            `),
        };
      },
    });

    this.searchNode.addEventListener("change", e => {
      const itemID = e.target.value;

      if (itemID && this.onSelect) {
        this.onSelect(itemID);
      }

      this.clear();
    });
  }

  clear() {
    if (!this.choices) return;

    this.choices.removeActiveItems();
    this.choices.setChoiceByValue("");
  }
}