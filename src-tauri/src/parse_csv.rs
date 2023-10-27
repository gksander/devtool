use csv::ReaderBuilder;
use std::collections::HashMap;
use std::fs::read;
use std::{fs::File, io::Write};
use tauri;

// Extract fields from CSV file and return as JSON
#[tauri::command]
pub fn preview_csv_to_json(
    data: &str,
    fields: Vec<&str>,
    is_file_path: bool,
) -> (Vec<String>, String) {
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

    let mut i = 0;
    for result in rdr.deserialize() {
        i += 1;
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

        if i > 10 {
            break;
        }
    }

    (headers, serde_json::to_string_pretty(&records).unwrap())
}

#[tauri::command]
pub fn export_csv_to_json(
    data: &str,
    fields: Vec<&str>,
    is_file_path: bool,
    output_path: &str,
    to_clipboard: bool,
) -> String {
    let bytes = if is_file_path {
        read(data).unwrap()
    } else {
        data.as_bytes().to_vec()
    };

    let mut rdr = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(&bytes[..]);

    let mut records: Vec<HashMap<String, String>> = Vec::new();
    let has_fields_specified = fields.len() > 0;

    for result in rdr.deserialize() {
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

    let record_json = serde_json::to_string_pretty(&records).unwrap();

    if to_clipboard {
        return record_json;
    } else {
        let mut file = File::create(output_path).expect("Expected file path");
        file.write_all(record_json.as_bytes())
            .expect("Unable to write to file");
    }

    String::from("")
}
