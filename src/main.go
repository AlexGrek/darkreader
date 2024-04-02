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

    http.Handle("/", r)

    // Start the server
    http.ListenAndServe(":6969", nil)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
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