package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"time"
)

const ACCESS_READER = "reader"
const ACCESS_CONTRIBUTOR = "contributor"
const ACCESS_MASTER = "master"

// Password represents a master password
type Password struct {
	ID       int    `json:"id"`
	Level    string `json:"level"`
	Password string `json:"password"`
}

func InitPasswd() {
	rand.Seed(time.Now().UnixNano())
	filePath := os.Getenv("MASTER_PASSWORDS_FILE")
	if filePath == "" {
		filePath = "master_passwords.json"
	}

	// Check if the JSON file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		// If the file does not exist, generate random passwords and dump them into the file
		fmt.Println("Generating passwords...")
		passwords := generatePasswords(10) // Generate 10 random passwords
		savePasswordsToFile(filePath, passwords)
		fmt.Println("Passwords generated and saved to", filePath)
	} else {
		// If the file exists, read the passwords from the file
		passwords, err := readPasswordsFromFile(filePath)
		if err != nil {
			fmt.Println("Error reading passwords:", err)
			return
		}

		// Print the read passwords
		fmt.Println("Read passwords from file:")
		for _, password := range passwords {
			fmt.Println(password)
		}
	}
}

func generatePasswords(count int) []Password {
	var passwords []Password
	for i := 1; i <= count; i++ {
		password := Password{
			ID:       i,
			Level:    "reader",
			Password: generateNumericPassword(4),
		}
		passwords = append(passwords, password)
	}
	for i := 1; i <= count; i++ {
		password := Password{
			ID:       i + len(passwords),
			Level:    "contributor",
			Password: generateRandomPassword(6),
		}
		passwords = append(passwords, password)
	}
	masterPassword := Password{
		ID:       100000,
		Level:    "master",
		Password: generateRandomPassword(12),
	}
	passwords = append(passwords, masterPassword)
	return passwords
}

func generateRandomPassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	password := make([]byte, length)
	for i := range password {
		password[i] = charset[rand.Intn(len(charset))]
	}
	return string(password)
}

func generateNumericPassword(length int) string {
	const charset = "0123456789"
	password := make([]byte, length)
	for i := range password {
		password[i] = charset[rand.Intn(len(charset))]
	}
	return string(password)
}

// savePasswordsToFile saves passwords to a JSON file
func savePasswordsToFile(filePath string, passwords []Password) error {
	data, err := json.MarshalIndent(passwords, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(filePath, data, 0644)
}

// readPasswordsFromFile reads passwords from a JSON file
func readPasswordsFromFile(filePath string) ([]Password, error) {
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, err
	}
	var passwords []Password
	if err := json.Unmarshal(data, &passwords); err != nil {
		return nil, err
	}
	return passwords, nil
}
