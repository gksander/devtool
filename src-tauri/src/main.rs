// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod hashing;


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            hashing::hash_sha256,
            hashing::hash_sha512
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
