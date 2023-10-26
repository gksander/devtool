use csv::{ReaderBuilder};
use std::collections::HashMap;
use std::fs::read;

// Extract fields from CSV file and return as JSON
#[tauri::command]
pub fn csv_as_json(
    data: &str,
    fields: Vec<&str>,
    is_file_path: bool,
) -> (Vec<String>, Vec<HashMap<String, String>>) {
    let bytes = if is_file_path {
        read(data).unwrap()
    } else {
        data.as_bytes().to_vec()
    };

    let mut rdr = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(&bytes[..]);

    let headers: Vec<String> = rdr
        .headers()
        .expect("expected header")
        .iter()
        .map(|x| String::from(x))
        .collect();

    let mut records: Vec<HashMap<String, String>> = Vec::new();
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

    (headers, records)
}
