// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod hashing;
mod parse_csv;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hashing::hash,
            parse_csv::preview_csv_to_json,
            parse_csv::export_csv_to_json
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
