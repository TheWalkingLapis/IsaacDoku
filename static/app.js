async function get_daily() {
  const res = await fetch("/data/daily");
  const data = await res.json();
  return data
}

async function get_items() {
  const res = await fetch("/data/items");
  const data = await res.json();
  return data
}

async function init_item_search() {
  // setup datalist for allowed values and autocomplete:
  
  const div = document.querySelector("#item-search-datalist-div");
  const datalist = document.createElement("datalist");
  datalist.setAttribute("id", "item-search-datalist");
  const items = await get_items();
  for (let item of items) {
    const option = document.createElement("option");
    option.setAttribute("value", item["Name"]);
    datalist.appendChild(option);
  }
  div.appendChild(datalist);

  // configure input event
  const itemSearch = document.querySelector("#item-search");
  itemSearch.addEventListener('input', (e) => {
    const selectedValue = e.target.value.trim();

    // Check if the input value exists in the datalist options
    const selectedOption = Array.from(datalist.options).find(
      option => option.value === selectedValue
    );
  
    if (selectedOption) {
      console.log(selectedValue);
      e.target.value = "";
    }
  });
}

get_daily()

await init_item_search()


