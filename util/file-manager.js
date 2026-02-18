import { File, Directory, Paths } from 'expo-file-system';
import * as debbug_lib from './debbug.js';

// Helper : retourne une instance File depuis un nom de fichier
const getFile = (file_name) => new File(Paths.document, file_name);

// ─────────────────────────────────────────────
// Création d'un fichier vide ou avec contenu
// ─────────────────────────────────────────────
export const create_file = async (file_name, content = "") => {
  try {
    const file = getFile(file_name);
    await file.create();
    await file.write(content);
    debbug_lib.debbug_log("[FM] File created: " + file_name, "green");
  } catch (error) {
    debbug_lib.debbug_log("[FM] Error in file creation: " + error.message, "red");
  }
};

// ─────────────────────────────────────────────
// Vérifie si un fichier existe
// ─────────────────────────────────────────────
export const is_file_existing = (file_name) => {
  const file = getFile(file_name);
  if (!file.exists) {
    console.warn('Fichier inexistant:', file.uri);
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────
// Suppression d'un fichier
// ─────────────────────────────────────────────
export const delete_file = async (file_name) => {
  try {
    const file = getFile(file_name);
    await file.delete();
    debbug_lib.debbug_log("[FM] File has been deleted successfully", "green");
  } catch (error) {
    debbug_lib.debbug_log("[FM] File " + file_name + " couldn't be deleted, err: " + error, "red");
  }
};

// ─────────────────────────────────────────────
// Sauvegarde un objet JS en JSON dans un fichier
// ─────────────────────────────────────────────
export const save_storage_local_storage_data = async (data, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] save_storage_local_storage_data", "yellow");
    const file = getFile(file_name);
    const jsonString = JSON.stringify(data);
    console.log('Data:', data);
    console.log('Full file path:', file.uri);
    await file.write(jsonString);
    console.log('Fichier écrit:', file.uri, 'Size:', file.size);
    console.log('File contents:', await file.text());
  } catch (error) {
    console.error('Error during file operation:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
  }
};

// ─────────────────────────────────────────────
// Sauvegarde une réponse fetch en JSON dans un fichier
// ─────────────────────────────────────────────
export const save_storage_local_storage_response = async (response, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] save_storage_local_storage_response", "yellow");
    const data = await response.json();
    const file = getFile(file_name);
    const jsonString = JSON.stringify(data);
    console.log('Data:', data);
    console.log('Full file path:', file.uri);
    await file.write(jsonString);
    console.log('Fichier écrit:', file.uri, 'Size:', file.size);
    console.log('File contents:', await file.text());
  } catch (error) {
    console.error('Error during file operation:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
  }
};

// ─────────────────────────────────────────────
// Modifie une clé spécifique dans un fichier JSON
// ─────────────────────────────────────────────
export const modify_value_local_storage = async (key, value, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] modify_value_local_storage", "yellow");
    const file = getFile(file_name);
    let existingData = {};

    if (file.exists) {
      try {
        existingData = JSON.parse(await file.text());
      } catch {
        console.warn('Failed to parse existing file, starting with empty object.');
      }
    }

    existingData[key] = value;
    await file.write(JSON.stringify(existingData));
    console.log('File modified:', file.uri, 'Size:', file.size);
    console.log('File contents:', await file.text());
  } catch (error) {
    console.error('Error during file operation:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.stack) console.error('Error stack:', error.stack);
  }
};

// ─────────────────────────────────────────────
// Ajoute une clé dans un fichier JSON (sans écraser)
// ─────────────────────────────────────────────
export const add_value_to_local_storage = async (key, value, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] add_value_to_local_storage", "yellow");
    const file = getFile(file_name);
    let existingData = {};

    if (file.exists) {
      try {
        existingData = JSON.parse(await file.text());
      } catch {
        console.warn('Failed to parse existing file, will overwrite with new object.');
      }
    }

    if (Object.prototype.hasOwnProperty.call(existingData, key)) {
      console.warn(`Key "${key}" already exists. Use modify_value_local_storage to update existing keys.`);
      return false;
    }

    existingData[key] = value;
    await file.write(JSON.stringify(existingData));
    console.log(`Added key "${key}" with value "${value}" to`, file.uri);
    return true;
  } catch (error) {
    console.error('Error while adding value to local storage:', error);
    return false;
  }
};

// ─────────────────────────────────────────────
// Lit et parse un fichier JSON
// ─────────────────────────────────────────────
export const read_file = async (file_name, if_not_create = false) => {
  try {
    debbug_lib.debbug_log("[FM] read_file", "yellow");
    const file = getFile(file_name);
    console.log('Lecture du fichier:', file.uri);

    if (!file.exists) {
      console.warn('Fichier inexistant:', file.uri);
      if (if_not_create) {
        await file.create();
        debbug_lib.debbug_log("[FM] created file", "yellow");
        return null;
      } else {
        return null;
      }
    }

    const fileContents = await file.text();
    console.log('Contenu du fichier:', fileContents);
    const parsedData = JSON.parse(fileContents);
    console.log('Parse du json:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error reading file:', error);
    if (error instanceof SyntaxError) {
      console.error('Failed to parse JSON - file may be corrupted');
    }
    return null;
  }
};

// ─────────────────────────────────────────────
// Supprime une clé dans un fichier JSON
// ─────────────────────────────────────────────
export const delete_key_from_local_storage = async (key, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] delete_key_from_local_storage", "yellow");
    const file = getFile(file_name);

    if (!file.exists) {
      console.warn('File does not exist:', file.uri);
      return false;
    }

    let existingData;
    try {
      existingData = JSON.parse(await file.text());
    } catch {
      console.error('Failed to parse existing file');
      return false;
    }

    if (!Object.prototype.hasOwnProperty.call(existingData, key)) {
      console.warn(`Key "${key}" does not exist in the file`);
      return false;
    }

    delete existingData[key];
    await file.write(JSON.stringify(existingData));
    console.log(`Deleted key "${key}" from`, file.uri);
    return true;
  } catch (error) {
    console.error('Error while deleting key from local storage:', error);
    return false;
  }
};

// ─────────────────────────────────────────────
// Vérifie si une clé existe dans un fichier JSON
// ─────────────────────────────────────────────
export const check_key_exists = async (key, file_name) => {
  try {
    debbug_lib.debbug_log("[FM] check_key_exists", "yellow");
    const data = await read_file(file_name);
    if (data === null) return false;
    return Object.prototype.hasOwnProperty.call(data, key);
  } catch (error) {
    console.error('Error checking if key exists:', error);
    return false;
  }
};
