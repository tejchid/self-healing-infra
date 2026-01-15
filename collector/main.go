package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/segmentio/kafka-go"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

type SystemStats struct {
	Timestamp int64   `json:"timestamp"`
	CPU       float64 `json:"cpu"`
	Memory    float64 `json:"memory"`
}

func main() {
	writer := &kafka.Writer{
		Addr:     kafka.TCP("localhost:9092"),
		Topic:    "system-vitals",
		Balancer: &kafka.LeastBytes{},
	}

	fmt.Println("Collector Started... Sending stats to Kafka every 2 seconds")

	for {
		c, _ := cpu.Percent(0, false)
		m, _ := mem.VirtualMemory()

		stats := SystemStats{
			Timestamp: time.Now().Unix(),
			CPU:       c[0],
			Memory:    m.UsedPercent,
		}

		payload, _ := json.Marshal(stats)

		err := writer.WriteMessages(context.Background(),
			kafka.Message{Value: payload},
		)

		if err != nil {
			fmt.Printf("Warning: Could not send to Kafka: %v\n", err)
		} else {
			fmt.Printf("Sent to Kafka: CPU: %.2f%% | MEM: %.2f%%\n", stats.CPU, stats.Memory)
		}

		time.Sleep(2 * time.Second)
	}
}