use data_encoding::HEXUPPER;
use ring::digest;

#[tauri::command]
pub fn hash_sha256(data: &str, is_file_path: bool) -> String {
    let bytes = match is_file_path {
        true => std::fs::read(data).unwrap(),
        false => data.as_bytes().to_vec(),
    };
    let actual = digest::digest(&digest::SHA256, &bytes);
    HEXUPPER.encode(actual.as_ref())
}

#[tauri::command]
pub fn hash_sha384(data: &str, is_file_path: bool) -> String {
    let bytes = match is_file_path {
        true => std::fs::read(data).unwrap(),
        false => data.as_bytes().to_vec(),
    };
    let actual = digest::digest(&digest::SHA384, &bytes);
    HEXUPPER.encode(actual.as_ref())
}

#[tauri::command]
pub fn hash_sha512(data: &str, is_file_path: bool) -> String {
    let bytes = match is_file_path {
        true => std::fs::read(data).unwrap(),
        false => data.as_bytes().to_vec(),
    };
    let actual = digest::digest(&digest::SHA512, &bytes);
    HEXUPPER.encode(actual.as_ref())
}
