package main

import (
    "encoding/json"
    "net/http"

    "github.com/gorilla/mux"
    "github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte("secret"))

func main() {
	InitPasswd()

    r := mux.NewRouter()

    // Serve the React SPA and static files
    r.PathPrefix("/").Handler(http.FileServer(http.Dir("./static")))

    // Define your API routes
    r.HandleFunc("/api/login", loginHandler).Methods("POST")
    r.HandleFunc("/api/logout", logoutHandler).Methods("GET")
	r.HandleFunc("/api/echo", logoutHandler).Methods("POST")

    http.Handle("/", r)

    // Start the server
    http.ListenAndServe(":6969", nil)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
		// Check if the request method is POST
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
	
		// Read the request body
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusBadRequest)
			return
		}
    // Authenticate the user (check credentials, etc.)
    // For simplicity, let's assume the user is authenticated
    // Create a session and set a cookie
    session, _ := store.Get(r, "session-name")
    session.Values["authenticated"] = true
    session.Save(r, w)

    // Return a response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{"authenticated": true})
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

func echoHandler(w http.ResponseWriter, r *http.Request) {
	// Check if the request method is POST
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	// do nothing, succesfully

		// Read the request body
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Error reading request body", http.StatusBadRequest)
			return
		}

    // Return a response
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(body)
}