use data_encoding::HEXUPPER;
use ring::digest;

#[tauri::command]
pub fn hash(data: &str, is_file_path: bool, hash_type: &str) -> String {
    let bytes = match is_file_path {
        true => std::fs::read(data).unwrap(),
        false => data.as_bytes().to_vec(),
    };

    let actual = match hash_type {
        "sha256" => digest::digest(&digest::SHA256, &bytes),
        "sha384" => digest::digest(&digest::SHA384, &bytes),
        "sha512" => digest::digest(&digest::SHA512, &bytes),
        _ => digest::digest(&digest::SHA256, &bytes),
    };

    HEXUPPER.encode(actual.as_ref())
}
