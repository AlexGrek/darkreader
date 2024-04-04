package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte("secret"))

func main() {
	InitPasswd()

	r := mux.NewRouter()

	

	// Define your API routes
	r.HandleFunc("/api/login", loginHandler).Methods("POST")
	r.HandleFunc("/api/logout", logoutHandler).Methods("GET")
	r.HandleFunc("/api/get_login_data", getLoginData).Methods("GET")
	r.HandleFunc("/api/echo", echoHandler).Methods("POST")
	r.HandleFunc("/api/echo_reader", echoHandlerReader).Methods("POST")
	r.HandleFunc("/api/echo_contributor", echoHandlerContributor).Methods("POST")
	r.HandleFunc("/api/text/{directory}/{filename}", HandleTextFileRequest).Methods("GET")

	// file-related handlers
	r.HandleFunc("/api/catalogs", GetCatalogsHandler).Methods("GET")
	r.HandleFunc("/api/catalog/{directory}", GetOneCatalogHandler).Methods("GET")
	r.HandleFunc("/api/create", HandleCreate).Methods("POST")
	r.HandleFunc("/api/append", HandleAppend).Methods("POST")

	// Serve the React SPA and static files
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))

	http.Handle("/", r)

	// Start the server
	http.ListenAndServe("0.0.0.0:6969", nil)
}

type LoginRequestBody struct {
	Password string `json:"password"`
}

func checkLoggedIn(w http.ResponseWriter, r *http.Request, requiredAccessLevel string) bool {
	fmt.Println("Protected request processing... (checking auth)")
    session, err := store.Get(r, "session-name")
    if err != nil {
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error: unauthenticated request detected")
        return false
    }

    // Check if the user is authenticated
    if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return false
    }
	level, ok := session.Values["level"].(string);
	fmt.Println("Permission level: ", level)
	if !ok || AuthLevelAsNumeric(level) < AuthLevelAsNumeric(requiredAccessLevel) {
		http.Error(w, "Higher permission level required", http.StatusForbidden)
		fmt.Println("Error: not enough permissions, required:", requiredAccessLevel)
		return false
	}
    return true
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	// Check if the request method is POST
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	var requestBody LoginRequestBody
	if err := json.Unmarshal(body, &requestBody); err != nil {
		http.Error(w, "Error decoding JSON", http.StatusBadRequest)
		return
	}
	level, err := GetAuthLevelForPasswd(requestBody.Password)
    if err != nil {
        http.Error(w, "Server error", http.StatusInternalServerError)
        return
    }
    if level == "" {
        // wrong password
        http.Error(w, "Wrong password", http.StatusForbidden)
        return
    }
	session, _ := store.Get(r, "session-name")
	session.Values["authenticated"] = true
	session.Values["level"] = level
		session.Save(r, w)

    fmt.Println("Logged in with password", requestBody.Password, "and level", level)

	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"authenticated": true, "level": level})
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	// Clear the session (logout)
	session, _ := store.Get(r, "session-name")
	session.Values["authenticated"] = false
	session.Save(r, w)

	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"authenticated": false})
}

func getLoginData(w http.ResponseWriter, r *http.Request) {
	session, err := store.Get(r, "session-name")
    if err != nil {
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error: unauthenticated request detected")
        return
    }

    // Check if the user is authenticated
    if auth, ok := session.Values["authenticated"].(bool); !ok || !auth {
        http.Error(w, "Unauthorized", http.StatusUnauthorized)
        return
    }
	level, ok := session.Values["level"].(string);
	if !ok || level == "" {
		http.Error(w, "Unauthorized: no level data", http.StatusUnauthorized)
		return
	}

	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"authenticated": true, "level": level})
}

func echoHandler(w http.ResponseWriter, r *http.Request) {
	// Check if the request method is POST
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// do nothing, succesfully

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(body)
}

func echoHandlerContributor(w http.ResponseWriter, r *http.Request) {
	// Check if the request method is POST
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// do nothing, succesfully

    if !checkLoggedIn(w, r, ACCESS_CONTRIBUTOR) {
        return
    }

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(body)
}

func echoHandlerReader(w http.ResponseWriter, r *http.Request) {
	// Check if the request method is POST
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// do nothing, succesfully

    if !checkLoggedIn(w, r, ACCESS_READER) {
        return
    }

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}

	// Return a response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(body)
}