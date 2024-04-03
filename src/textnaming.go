package main

import (
	"regexp"
	"strings"
)

func ConvertIntoFileNameString(input string) string {
	// Replace spaces with underscores
	input = strings.ReplaceAll(input, " ", "_")

	// Define regular expression to match unsupported characters
	unsupportedRegex := regexp.MustCompile(`[^a-zA-Z0-9а-яА-ЯіІїЇєЄёЁ_]`)

	// Remove unsupported characters
	input = unsupportedRegex.ReplaceAllString(input, "")

	return input
}

func ConvertIntoStoryNameString(input string) string {
	input = strings.ReplaceAll(input, "_", " ")
	return input
}