package main

import (
    "bufio"
    "fmt"
    "log"
    "net/http"
    "os"
    "strings"
    "time"
    "path/filepath"

    "github.com/PuerkitoBio/goquery"
    "github.com/fatih/color"
)



type Article struct {
    Title       string
    Description string
    Date        string
}

func main() {

    /* -------- HELP FLAG -------- */
    if len(os.Args) > 1 && os.Args[1] == "-h" {
        showHelp()
        return
    }

    reader := bufio.NewReader(os.Stdin)

    for {
        showMenu()

        fmt.Print(color.YellowString("Seçiminiz: "))
        choice, _ := reader.ReadString('\n')
        choice = strings.TrimSpace(choice)

        if choice == "4" {
            color.Red("Çıkış yapılıyor...")
            return
        }

        fmt.Print(color.CyanString("Filtreler (-date -description, boş bırakılabilir): "))
        filterInput, _ := reader.ReadString('\n')
        filterInput = strings.TrimSpace(filterInput)

        hideDate := strings.Contains(filterInput, "-date")
        hideDesc := strings.Contains(filterInput, "-description")

        var articles []Article
        var directoryName string
        var filename string

        switch choice {
        case "1":
            articles = scrapeHackerNews()
            directoryName = "hackernews"
            filename = generateFileName("hackernews")
        case "2":
            articles = scrapeBleepingComputer()
            directoryName = "bleepingcomputer"
            filename = generateFileName("bleepingcomputer")
        case "3":
            articles = scrapeGBHackers()
            directoryName = "gbhackers"
            filename = generateFileName("gbhackers")
        default:
            color.Red("Geçersiz seçim!")
            continue
        }

        saveToFile(articles, directoryName, filename, hideDate, hideDesc)
        color.Green("✔ Veriler başarıyla kaydedildi: %s\n", filename)
    }
}

/* ---------------- MENÜ ---------------- */

func showMenu() {
    // ASCII sanatını parçalı şekilde birleştirerek backtick sorununu çözüyoruz
    asciiArt := `__     __                   _            
\ \   / /                  | |           
 \ \_/ __ ___   ___   _ ___| | __ _ _ __ 
  \   / _` + "`" + ` \ \ / | | | |_  | |/ _` + "`" + ` | '__|
   | | (_| |\ V /| |_| |/ /| | (_| | |   
   |_|\__,_| \_/  \__,_/___|_|\__,_|_|`

    // Renkli yazdırma
    color.New(color.FgHiBlue, color.Bold).Println(asciiArt)
    fmt.Println(color.YellowString("Kullanmak için seçeneklerden birini seçin:"))
    // Menü seçenekleri
    color.Green("1 - The Hacker News")
    color.Green("2 - BleepingComputer")
    color.Green("3 - GBHackers")
    color.Red("4 - Çıkış")
    fmt.Println()
}

/* ---------------- HELP ---------------- */

func showHelp() {
    color.New(color.FgHiYellow, color.Bold).Println("CLI Web Scraper Yardım Menüsü\n")

    color.Cyan("Kullanım:")
    fmt.Println("  go run main.go")
    fmt.Println("  go run main.go -h\n")

    color.Cyan("Menü Seçenekleri:")
    fmt.Println("  1  -> The Hacker News sitesinden veri çeker")
    fmt.Println("  2  -> BleepingComputer sitesinden veri çeker")
    fmt.Println("  3  -> GBHackers sitesinden veri çeker")
    fmt.Println("  4  -> Uygulamadan çıkış yapar\n")

    color.Cyan("Filtre Parametreleri:")
    fmt.Println("  -date         -> Tarih bilgisini göstermez")
    fmt.Println("  -description  -> Açıklama bilgisini göstermez")
    fmt.Println("  Aynı anda kullanılabilir: -date -description\n")

    color.Green("Örnek:")
    fmt.Println("  Seçiminiz: 1")
    fmt.Println("  Filtreler: -date -description")
}

/* ---------------- SCRAPERS ---------------- */

func scrapeHackerNews() []Article {
    var articles []Article

    url := "https://thehackernews.com/"
    resp, err := http.Get(url)
    if err != nil {
        log.Println("Siteye ulaşılamadı:", err)
        return articles
    }
    defer resp.Body.Close()

    doc, err := goquery.NewDocumentFromReader(resp.Body)
    if err != nil {
        log.Println("HTML okunamadı:", err)
        return articles
    }

    doc.Find("div.body-post").Each(func(i int, s *goquery.Selection) {

        title := strings.TrimSpace(
            s.Find("h2.home-title").Text(),
        )

        description := strings.TrimSpace(
            s.Find("div.home-desc").Text(),
        )

        date := strings.TrimSpace(
            s.Find("span.h-datetime").Text(),
        )

        if title != "" {
            articles = append(articles, Article{
                Title:       title,
                Description: description,
                Date:        date,
            })
        }
    })

    return articles
}

func scrapeBleepingComputer() []Article {
    var articles []Article

    url := "https://www.bleepingcomputer.com/"

    client := &http.Client{}
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        log.Fatal("Request hazırlanamadı:", err)
    }

    req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    req.Header.Set("Accept-Language", "en-US,en;q=0.9")

    resp, err := client.Do(req)
    if err != nil {
        log.Println("Siteye ulaşılamadı:", err)
        return articles
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        log.Printf("Hata: Site %d durum kodu döndürdü. Muhtemelen engellendiniz.\n", resp.StatusCode)
        return articles
    }

    doc, err := goquery.NewDocumentFromReader(resp.Body)
    if err != nil {
        log.Println("HTML okunamadı:", err)
        return articles
    }

    doc.Find("#bc-home-news-main-wrap > li").Each(func(i int, s *goquery.Selection) {

        title := strings.TrimSpace(s.Find(".bc_latest_news_text h4 a").Text())

        description := strings.TrimSpace(s.Find(".bc_latest_news_text p").First().Text())

        date := strings.TrimSpace(s.Find("li.bc_news_date").Text())
        timeText := strings.TrimSpace(s.Find("li.bc_news_time").Text())

        fullDate := strings.TrimSpace(date + " " + timeText)

        if title != "" {
            articles = append(articles, Article{
                Title:       title,
                Description: description,
                Date:        fullDate,
            })
        }
    })

    return articles
}

func scrapeGBHackers() []Article {
    var articles []Article

    url := "https://gbhackers.com/"
    resp, err := http.Get(url)
    if err != nil {
        log.Println("Siteye ulaşılamadı:", err)
        return articles
    }
    defer resp.Body.Close()

    doc, err := goquery.NewDocumentFromReader(resp.Body)
    if err != nil {
        log.Println("HTML okunamadı:", err)
        return articles
    }

    doc.Find("div.td_module_10").Each(func(i int, s *goquery.Selection) {

        title := strings.TrimSpace(
            s.Find("h3.entry-title a").Text(),
        )

        description := strings.TrimSpace(
            s.Find("div.td-excerpt").Text(),
        )

        date := strings.TrimSpace(
            s.Find("time.entry-date").Text(),
        )

        if title != "" {
            articles = append(articles, Article{
                Title:       title,
                Description: description,
                Date:        date,
            })
        }
    })

    return articles
}

/* ---------------- FILE ---------------- */

func saveToFile(articles []Article, directoryName string, filename string, hideDate bool, hideDesc bool) {
    
    targetDir := filepath.Join("outputs", directoryName)
    err := os.MkdirAll(targetDir, 0755)
    if err != nil {
        log.Println("Klasör yapısı oluşturulamadı:", err)
        return
    }

    filePath := filepath.Join(targetDir, filename)

    file, err := os.Create(filePath)
    if err != nil {
        log.Println("Dosya oluşturulamadı (Klasörün varlığından emin olun):", err)
        return
    }
    defer file.Close()

    writer := bufio.NewWriter(file)

    for i, a := range articles {
        fmt.Fprintf(writer, "\n[%d]\n", i+1)
        fmt.Fprintf(writer, "Başlık: %s\n", a.Title)

        if !hideDesc {
            fmt.Fprintf(writer, "Açıklama: %s\n", a.Description)
        }

        if !hideDate {
            fmt.Fprintf(writer, "Tarih: %s\n", a.Date)
        }
    }

    writer.Flush()
    fmt.Printf("Dosya başarıyla kaydedildi: %s\n", filePath)
}

func generateFileName(site string) string {
    now := time.Now().Format("2006-01-02_15-04-05")
    return fmt.Sprintf("%s_%s.txt", site, now)
}