package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func GetCatalogsHandler(w http.ResponseWriter, r *http.Request) {
	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TextHierarchy())
}

func GetOneCatalogHandler(w http.ResponseWriter, r *http.Request) {
	// Return a response
	vars := mux.Vars(r)
	directory := vars["directory"]
	
	w.Header().Set("Content-Type", "application/json")
	name, catalog := TextHierarchyOneDir(directory)
	json.NewEncoder(w).Encode(map[string]interface{}{"path": name, "catalog": catalog})
}

func HandleTextFileRequest(w http.ResponseWriter, r *http.Request) {
	// Get the session
	session, err := store.Get(r, "session-name")
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Check if the user is authenticated
	if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract directory and filename from the URL path
	vars := mux.Vars(r)
	directory := vars["directory"]
	filename := vars["filename"]
	rootPath := os.Getenv("TEXT_PATH")
	if rootPath == "" {
		rootPath = "demotexts"
	}
	filePath := fmt.Sprintf("%s/%s/%s", rootPath, directory, filename)

	// Read the contents of the text file
	fileContents, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	// Send the file contents as the response
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	w.Write(fileContents)
}