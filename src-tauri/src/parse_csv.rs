use csv::ReaderBuilder;
use std::collections::HashMap;

// Extract CSV header from file
#[tauri::command]
pub fn extract_csv_headers(data_path: &str) -> Vec<String> {
    ReaderBuilder::new()
        .has_headers(true)
        .from_path(data_path)
        .expect("Expected path")
        .headers()
        .expect("Expected header")
        .iter()
        .map(|x| String::from(x))
        .collect()
}

// Extract fields from CSV file and return as JSON
#[tauri::command]
pub fn csv_as_json(data_path: &str, fields: Vec<&str>) -> Vec<HashMap<String, String>> {
    let mut rdr = ReaderBuilder::new()
        .has_headers(true)
        .from_path(data_path)
        .expect("Expected path");

    let mut records = Vec::new();

    let has_fields_specified = fields.len() > 0;

    for result in rdr.deserialize() {
        // TODO: Should we really skip errors?
        let record: HashMap<String, String> = match result {
            Ok(r) => r,
            _ => continue,
        };

        if has_fields_specified {
            let mut item = HashMap::new();
            for &field in &fields {
                let val = match record.get(field) {
                    Some(v) => v,
                    None => "",
                };

                item.insert(field.to_string(), String::from(val));
            }

            records.push(item);
        } else {
            records.push(record)
        }
    }

    records
}
