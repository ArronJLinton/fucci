package news

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"
)

// RapidAPIResponse represents the response from RapidAPI Real-Time News Data
type RapidAPIResponse struct {
	Status    string            `json:"status"`
	RequestID string            `json:"request_id"`
	Data      []RapidAPIArticle `json:"data"`
}

// RapidAPIArticle represents a single article from RapidAPI
type RapidAPIArticle struct {
	Title                string `json:"title"`
	Link                 string `json:"link"`
	Snippet              string `json:"snippet,omitempty"`
	PhotoURL             string `json:"photo_url,omitempty"`
	PublishedDatetimeUTC string `json:"published_datetime_utc"`
	SourceName           string `json:"source_name"`
	SourceURL            string `json:"source_url"`
	SourceLogoURL        string `json:"source_logo_url,omitempty"`
	SourceFaviconURL     string `json:"source_favicon_url,omitempty"`
}

// Client wraps the RapidAPI Real-Time News Data API client
type Client struct {
	apiKey  string
	baseURL string
	timeout time.Duration
}

// NewClient creates a new RapidAPI news client
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseURL: "https://real-time-news-data.p.rapidapi.com/search",
		timeout: 10 * time.Second,
	}
}

// FetchNewsOptions contains options for fetching news
type FetchNewsOptions struct {
	Query         string
	TimePublished string
	Limit         int
	Country       string
	Lang          string
}

// FetchNews fetches football news from RapidAPI with custom options
func (c *Client) FetchNews(opts FetchNewsOptions) (*RapidAPIResponse, error) {
	// Build query parameters
	params := url.Values{}
	params.Add("query", opts.Query)
	params.Add("limit", fmt.Sprintf("%d", opts.Limit))
	params.Add("time_published", opts.TimePublished)
	params.Add("country", opts.Country)
	params.Add("lang", opts.Lang)

	// Create HTTP request
	req, err := http.NewRequest("GET", c.baseURL+"?"+params.Encode(), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add RapidAPI headers
	req.Header.Add("X-RapidAPI-Key", c.apiKey)
	req.Header.Add("X-RapidAPI-Host", "real-time-news-data.p.rapidapi.com")

	// Make the request with timeout
	client := &http.Client{Timeout: c.timeout}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch news: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check if response is successful
	if resp.StatusCode != http.StatusOK {
		log.Printf("RapidAPI returned status %d: %s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse JSON response
	var newsResponse RapidAPIResponse
	if err := json.Unmarshal(body, &newsResponse); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}
	return &newsResponse, nil
}

// TodayAndHistoryResponse contains both today's and historical news responses
type TodayAndHistoryResponse struct {
	TodayResponse   *RapidAPIResponse
	HistoryResponse *RapidAPIResponse
}

// FetchTodayAndHistoryNews fetches both today's news and historical news
// Returns separate responses for today and history
func (c *Client) FetchTodayAndHistoryNews() (*TodayAndHistoryResponse, error) {
	// Default options
	defaultOpts := FetchNewsOptions{
		Country: "US",
		Lang:    "en",
		Limit:   5, // Limit to 5 articles per section
	}

	// Fetch today's news
	todayOpts := defaultOpts
	todayOpts.Query = "today's world football"
	todayOpts.TimePublished = "1d" // Valid values: anytime, 1h, 1d, 7d, 1m, 1y

	todayResp, err := c.FetchNews(todayOpts)
	if err != nil {
		log.Printf("Failed to fetch today's news: %v", err)
		// Continue with history even if today fails
		todayResp = &RapidAPIResponse{Data: []RapidAPIArticle{}}
	}

	// Fetch historical news
	historyOpts := defaultOpts
	historyOpts.Query = "World Football History"
	historyOpts.TimePublished = "anytime"

	historyResp, err := c.FetchNews(historyOpts)
	if err != nil {
		log.Printf("Failed to fetch historical news: %v", err)
		// If history fails but today succeeded, return today's results with empty history
		if todayResp == nil {
			todayResp = &RapidAPIResponse{Data: []RapidAPIArticle{}}
		}
		historyResp = &RapidAPIResponse{Data: []RapidAPIArticle{}}
	}

	return &TodayAndHistoryResponse{
		TodayResponse:   todayResp,
		HistoryResponse: historyResp,
	}, nil
}
