package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"
)

var (
	requestCount int64
	ready        bool
	version      = getEnv("VERSION", "v1")
	startupDelay = getEnvInt("STARTUP_DELAY", 0)
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func main() {
	hostname, _ := os.Hostname()

	// Simulate slow startup
	if startupDelay > 0 {
		log.Printf("Simulating slow startup: %dms", startupDelay)
		time.Sleep(time.Duration(startupDelay) * time.Millisecond)
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "version": version})
	})

	mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if ready {
			json.NewEncoder(w).Encode(map[string]string{"status": "ready", "version": version})
		} else {
			w.WriteHeader(http.StatusServiceUnavailable)
			json.NewEncoder(w).Encode(map[string]string{"status": "not ready"})
		}
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		atomic.AddInt64(&requestCount, 1)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":      fmt.Sprintf("Hello from Go %s!", version),
			"requestCount": atomic.LoadInt64(&requestCount),
			"hostname":     hostname,
		})
	})

	mux.HandleFunc("/api/cpu-stress", func(w http.ResponseWriter, r *http.Request) {
		duration := 1000
		if d := r.URL.Query().Get("ms"); d != "" {
			if v, err := strconv.Atoi(d); err == nil {
				duration = v
			}
		}
		end := time.Now().Add(time.Duration(duration) * time.Millisecond)
		for time.Now().Before(end) {
			math.Sqrt(12345.6789)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"stressed": true,
			"duration": duration,
		})
	})

	server := &http.Server{
		Addr:    ":3000",
		Handler: mux,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)
		<-sigChan
		log.Println("SIGTERM received — shutting down gracefully")
		ready = false
		server.Close()
	}()

	ready = true
	log.Printf("Go API %s listening on :3000", version)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
