package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/bmaupin/go-epub"
)

// GenerateEPUB builds an EPUB from ordered text files.
// It returns the full output path, a hash of all input files, and an error.
// The output file name is the first 9 chars of the hash + ".epub".
func GenerateEPUB(txtFiles []string, bookName string, outputDir string) (string, string, error) {
	if len(txtFiles) == 0 {
		return "", "", fmt.Errorf("no txt files provided")
	}

	h := sha256.New()
	for _, f := range txtFiles {
		fi, err := os.Open(f)
		if err != nil {
			return "", "", err
		}
		if _, err := io.Copy(h, fi); err != nil {
			fi.Close()
			return "", "", err
		}
		fi.Close()
	}

	hashHex := hex.EncodeToString(h.Sum(nil))
	short := hashHex[:9]
	outPath := filepath.Join(outputDir, short+".epub")

	if _, err := os.Stat(outPath); err == nil {
		return outPath, hashHex, nil
	}

	e := epub.NewEpub(bookName)
	e.SetTitle(bookName)

	// Add header first page
	header := fmt.Sprintf("<h1>%s</h1>", escape(bookName))
	if _, err := e.AddSection(header, "Header", "", ""); err != nil {
		return "", "", err
	}

	for i, f := range txtFiles {
		// chapters start after header
		b, err := os.ReadFile(f)
		if err != nil {
			return "", "", err
		}
		content := fmt.Sprintf("<h1># %d</h1>\n<p>%s</p>", i+1, escape(string(b)))
		_, err = e.AddSection(content, filepath.Base(f), "", "")
		if err != nil {
			return "", "", err
		}
	}

	if err := e.Write(outPath); err != nil {
		return "", "", err
	}

	return outPath, hashHex, nil
}

func escape(s string) string {
	r := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		"\n", "<br/>",
	)
	return r.Replace(s)
}
