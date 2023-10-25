use data_encoding::HEXUPPER;
use ring::digest;

#[tauri::command]
pub fn hash_sha256(data: &str) -> String {
    let actual = digest::digest(&digest::SHA256, data.as_bytes());
    HEXUPPER.encode(actual.as_ref())
}

#[tauri::command]
pub fn hash_sha384(data: &str) -> String {
    let actual = digest::digest(&digest::SHA384, data.as_bytes());
    HEXUPPER.encode(actual.as_ref())
}

#[tauri::command]
pub fn hash_sha512(data: &str) -> String {
    let actual = digest::digest(&digest::SHA512, data.as_bytes());
    HEXUPPER.encode(actual.as_ref())
}
