package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"

	"github.com/goteleport-interview/fs4/api"
)

const listenPort = 8080

//go:embed web/dist
var assets embed.FS

func main() {
	webassets, err := fs.Sub(assets, "web/dist")
	if err != nil {
		log.Fatalln("could not embed webassets", err)
	}

	s, err := api.NewServer(webassets)
	if err != nil {
		log.Fatalln(err)
	}

	log.Fatalln(s.ListenAndServe(fmt.Sprintf("localhost:%d", listenPort)))
}
