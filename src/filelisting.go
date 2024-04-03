package main

import (
	"log"
	"os"
	"path/filepath"
)

type Catalog struct {
	Files       []string `json:"files"`
	Tags        []string `json:"tags"`
	Description string   `json:"description"`
	PrettyName  string   `json:"prettyName"`
	Pages int64          `json:"pages"`
}

func GenerateHierarchy(rootPath string) (map[string]Catalog, error) {
	result := make(map[string]Catalog)

	// Get list of directories in the rootPath
	dirs, err := os.ReadDir(rootPath)
	if err != nil {
		return nil, err
	}

	for _, dir := range dirs {
		if dir.IsDir() {
			catalogName := dir.Name()
			catalogName, catalog := GenerateCatalog(catalogName, rootPath)

			result[catalogName] = catalog
		}
	}

	return result, nil
}

func GenerateCatalog(catalogName string, rootPath string) (string, Catalog) {
	
	catalog := Catalog{
		Files:       []string{},
		Tags:        []string{},
		Description: "",
		PrettyName:  "",
		Pages:       0,
	}
	catalog.Description = ""
	catalog.Tags = make([]string, 0)
	catalog.PrettyName = ConvertIntoStoryNameString(catalogName)

	files, err := os.ReadDir(filepath.Join(rootPath, catalogName))
	if err != nil {
		log.Println(err)
		catalog.PrettyName = err.Error()
		return catalogName, catalog
	}

	for _, file := range files {
		if !file.IsDir() {
			catalog.Files = append(catalog.Files, file.Name())
		}
	}

	size, err := calculateTotalTxtFileSize(filepath.Join(rootPath, catalogName))
	if err == nil {
		catalog.Pages = size / 1500
	}
	return catalogName, catalog
}

func TextHierarchy() map[string]Catalog {
	rootPath := os.Getenv("TEXT_PATH")
	if rootPath == "" {
		rootPath = "demotexts"
	}
	hierarchy, err := GenerateHierarchy(rootPath)
	if err != nil {
		log.Fatal(err)
	}
	return hierarchy
}

func TextHierarchyOneDir(directory string) (string,Catalog) {
	rootPath := os.Getenv("TEXT_PATH")
	if rootPath == "" {
		rootPath = "demotexts"
	}
	name, catalog := GenerateCatalog(directory, rootPath)
	return name, catalog
}

func calculateTotalTxtFileSize(directory string) (int64, error) {
    var totalSize int64
    err := filepath.Walk(directory, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if !info.IsDir() && filepath.Ext(info.Name()) == ".txt" {
            size, err := fileSize(path)
            if err != nil {
                return err
            }
            totalSize += size
        }
        return nil
    })
    if err != nil {
        return 0, err
    }
    return totalSize, nil
}

func fileSize(path string) (int64, error) {
    fileInfo, err := os.Stat(path)
    if err != nil {
        return 0, err
    }
    return fileInfo.Size(), nil
}