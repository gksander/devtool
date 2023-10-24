use sha2::{Sha256, Sha512, Digest};

#[tauri::command]
pub fn hash_sha256(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    format!("{:x}", result)
}


#[tauri::command]
pub fn hash_sha512(data: &str) -> String {
    let mut hasher = Sha512::new();
    hasher.update(data);
    let result = hasher.finalize();
    format!("{:x}", result)
}
