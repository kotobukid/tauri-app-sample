// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;
use std::fmt::format;
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/comman
use std::fs::{File, OpenOptions};
use std::io::{self, Read, Write, BufReader, Seek, SeekFrom};

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
        },
        Err(e) => {
            format!("Hello, {}! You've been greeted from Rust!", name)
            // 失敗した理由も出力するにゃ
            // Err(e)
        }
    }
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
