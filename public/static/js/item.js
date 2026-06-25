import { fetch_file_cached, parse_csv } from "./utils.js";

export class Item {
    constructor(data) {
        this.data = data;
    }

    id () {
        return this.data["ID"];
    }

    name() {
        return this.data["Name"];
    }

    description() {
        return this.data["Description"];
    }

    img() {
        return "static/images/items/" + this.data["GfxFileName"].split("/")[3].toLowerCase();
    }

}

export class ItemList {
    constructor() {
        this.items = {};
    }

    static async create() {
        const [ itemData , propertyKeys ] = parse_csv(await fetch_file_cached("fetch_items"), true);
        const itemList = new ItemList();
        for (const data of Object.values(itemData)) {
            const item = new Item(data);
            itemList.items[item.id()] = item;
        }
        return itemList;
    }

    get(id) {
        if (!id in this.items) 
            return null;

        return this.items[id];
    }

    get_all() {
        return Object.values(this.items);
    }
}