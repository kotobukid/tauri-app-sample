// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, api::dialog};
use std::fs::{File, OpenOptions};
use std::io::{Read, Write, BufReader};

#[tauri::command]
fn greet(name: &str) -> String {
    let file = OpenOptions::new()
        .write(true)
        .append(true)
        .create(true)
        .open("../logs/message_history.txt");
    let name = format!("{}\n", name);

    match file {
        Ok(mut f) => {
            let mut buf = BufReader::new(name.as_bytes());
            let mut bytes = Vec::new();
            buf.read_to_end(&mut bytes).unwrap();

            f.write_all(&bytes).expect("write failed");

            format!("Hello, {}! You've been greeted from Rust!", name)
        }
        Err(_e) => {
            format!("Hello, {}! You've been greeted from Rust!", name)
            // Err(e)
        }
    }
}

#[tauri::command]
fn save_blob(args: Vec<u8>) -> Result<(), String> {
    let data = args;
    use dialog::FileDialogBuilder;
    use std::fs::File;
    use std::io::Write;

    FileDialogBuilder::new().save_file(move |file_paths| {
        match file_paths {
            Some(path) => {
                let mut pathstr = "".to_string();
                match path.to_str() {
                    Some(s) => {
                        pathstr = s.to_string();
                        let mut file = File::create(pathstr).map_err(|e| e.to_string()).unwrap();
                        file.write_all(&data).map_err(|e| e.to_string()).unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    });
    Ok(())
}


fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                // window.close_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, save_blob])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
