package main

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/fatih/color"
)

type Article struct {
	Title       string
	Description string
	Date        string
}

type SiteConfig struct {
	Name         string
	URL          string
	Item         string
	Title        string
	Description  string
	Date         string
	UseUserAgent bool
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "-h" {
		showHelp()
		return
	}

	configs := map[string]SiteConfig{
		"1": {
			Name: "hackernews", URL: "https://thehackernews.com/",
			Item: "div.body-post", Title: "h2.home-title",
			Description: "div.home-desc", Date: "span.h-datetime",
			UseUserAgent: false,
		},
		"2": {
			Name: "bleepingcomputer", URL: "https://www.bleepingcomputer.com/",
			Item: "#bc-home-news-main-wrap > li", Title: ".bc_latest_news_text h4 a",
			Description: ".bc_latest_news_text p", Date: "li.bc_news_date",
			UseUserAgent: true,
		},
		"3": {
			Name: "gbhackers", URL: "https://gbhackers.com/",
			Item: "div.td_module_10", Title: "h3.entry-title a",
			Description: "div.td-excerpt", Date: "time.entry-date",
			UseUserAgent: false,
		},
	}

	reader := bufio.NewReader(os.Stdin)

	for {
		showMenu()
		fmt.Print(color.YellowString("Your Choice :"))
		choice, _ := reader.ReadString('\n')
		choice = strings.TrimSpace(choice)

		if choice == "4" {
			color.Red("Exiting...")
			break
		}

		config, ok := configs[choice]
		if !ok {
			color.Red("Invalid selection!")
			continue
		}

		fmt.Print(color.CyanString("Filters (-date -description, can be left blank): "))
		filterInput, _ := reader.ReadString('\n')
		
		articles := scrape(config)
		
		if len(articles) == 0 {
			color.Red("No news found or could not access the site.")
			continue
		}

		hideDate := strings.Contains(filterInput, "-date")
		hideDesc := strings.Contains(filterInput, "-description")
		
		filename := fmt.Sprintf("%s_%s.txt", config.Name, time.Now().Format("2006-01-02_15-04-05"))
		saveToFile(articles, config.Name, filename, hideDate, hideDesc)

		color.HiGreen("Process Completed: %d news items saved to '%s' folder.\n", len(articles), config.Name)
	}
}

func scrape(conf SiteConfig) []Article {
	var articles []Article

	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", conf.URL, nil)

	if conf.UseUserAgent {
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Connection error (%s): %v\n", conf.Name, err)
		return articles
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return articles
	}

	doc.Find(conf.Item).Each(func(i int, s *goquery.Selection) {
		title := strings.TrimSpace(s.Find(conf.Title).Text())
		if title == "" {
			return
		}

		articles = append(articles, Article{
			Title:       title,
			Description: strings.TrimSpace(s.Find(conf.Description).First().Text()),
			Date:        strings.TrimSpace(s.Find(conf.Date).Text()),
		})
	})

	return articles
}

func saveToFile(articles []Article, dir, filename string, hideDate, hideDesc bool) {
	path := filepath.Join("outputs", dir)
	os.MkdirAll(path, 0755)

	file, err := os.Create(filepath.Join(path, filename))
	if err != nil {
		log.Println("File error:", err)
		return
	}
	defer file.Close()

	writer := bufio.NewWriter(file)
	for i, a := range articles {
		fmt.Fprintf(writer, "[%d] %s\n", i+1, a.Title)
		if !hideDesc && a.Description != "" {
			fmt.Fprintf(writer, "Description: %s\n", a.Description)
		}
		if !hideDate && a.Date != "" {
			fmt.Fprintf(writer, "Date: %s\n", a.Date)
		}
		fmt.Fprintln(writer, strings.Repeat("-", 30))
	}
	writer.Flush()
}

func showMenu() {
	banner := `
 __      __                    _            
 \ \    / /                   | |           
  \ \__/ /_ ___    ___   _ ___| | __ _ _ __ 
   \  / _` + "`" + ` \ \ / / | | |_  / |/ _` + "`" + ` | '__|
    | | (_| |\ V /| |_| |/ /| | (_| | |   
    |_|\__,_| \_/  \__,_/___|_|\__,_|_|   
                                           `
	color.HiBlue(banner)
	fmt.Println(color.YellowString("Select a source:"))
	fmt.Println("1) The Hacker News")
	fmt.Println("2) BleepingComputer")
	fmt.Println("3) GBHackers")
	color.Red("4) Exit")
}

func showHelp() {
	color.Yellow("Usage: go run main.go\nAfter selecting a news source, you can filter outputs by typing '-date' or '-description'.")
}