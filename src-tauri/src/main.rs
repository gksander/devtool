// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod hashing;
mod parse_csv;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hashing::hash_sha256,
            hashing::hash_sha384,
            hashing::hash_sha512,
            parse_csv::extract_csv_headers,
            parse_csv::csv_as_json,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
