import { fetch_file_cached } from "./utils.js";

export class Category {
    constructor(id, description, img, conditions) {
        this.id = id;
        this.name = id.replace("_", " ");
        this.description = description;
        this.img = img;
        this.conditions = conditions;
    }
}

export const NULL_CATEGORY = new Category("invalid", "not a valid category", undefined, "");

async function collect_categories() {
    const raw = JSON.parse(await fetch_file_cached("fetch_categories"));
    const categories = [];
    for (const c of raw) {
        const imgPath = c.img ? "/static/images/category/" + c.img : "/static/images/questionmark.png"
        categories.push(new Category(c.id, c.description, imgPath, c.conditions))
    }
    return categories;
}
export const ALL_CATEGORIES = await collect_categories();

export function get_category(id) {
    return NULL_CATEGORY;
}