async function get_categories() {
  const res = await fetch("/categories");
  const data = await res.json();
  return data
}

let categories = await get_categories();
console.log(categories);