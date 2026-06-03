

const file_content_cache = {
  "fetch_category_match": "",
  "fetch_category_assignments": "",
  "fetch_categories": "",
  "fetch_items": "",
}

export async function fetch_file_cached(api_name) {
  if (!(api_name in file_content_cache)) {
    console.error("Invalid api call in fetch_file_cached!");
    return "";
  }

  if (file_content_cache[api_name] !== "") {
    return file_content_cache[api_name]
  }

  const api = "/api/" + api_name + ".php"
  const result = await fetch(api).then(res => res.text());
  file_content_cache[api_name] = result;
  return result
}

// parses csv and converts string to numbers if valid num, same for bools
export function parse_csv(text, keepFirstColumn = false) {
  function split_line(line) {
    // make sure to not split at commas within " "
    const fields = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    return fields.map(f => f.replace(/^"|"$/g, ""));
  }

  const lines = text.replace(/\r/g, "").trim().split("\n").map(l => split_line(l));
  const headers = lines[0];
  
  const rows = lines.slice(1);

  const data = {};
  const categoryIDs = headers.slice(1);

  for (const row of rows) {
    const rowKey = row[0];
    data[rowKey] = {};

    for (let i = keepFirstColumn ? 0 : 1; i < headers.length; i++) {
      const col = headers[i];
      const value = row[i];
      const num = Number(value);
      const boolValues = ["True", "true", "False", "false"];
      const bool = value == "true" || value == "True";
      data[rowKey][col] =
        (value !== undefined && value !== "") ? (!Number.isNaN(num) ? num : ((boolValues.includes(value)) ? bool : value)) : value;
    }
  }

  return [ data, categoryIDs ];
}

export function get_today() {
  return new Date().toJSON().split("T")[0];
}