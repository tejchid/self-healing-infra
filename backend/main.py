import asyncio
import json
import os
import subprocess
import psutil
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaConsumer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_stats = {
    "cpu": 0, 
    "memory": 0, 
    "ai_analysis": "Monitoring system vitals...",
    "top_process": "None"
}

async def get_top_process():
    """Identifies the highest CPU consumer for the AI diagnostic"""
    processes = []
    for proc in psutil.process_iter(['name', 'cpu_percent']):
        try:
            processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    if not processes: return "None"
    top = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[0]
    return top['name']

@app.post("/trigger-chaos")
async def trigger_chaos():
    """Simulates a system runaway by saturating CPU cores"""
    cmd = "for i in $(seq 1 $(sysctl -n hw.ncpu)); do yes > /dev/null & done; sleep 10; killall yes"
    subprocess.Popen(cmd, shell=True, executable="/bin/zsh")
    return {"status": "Chaos initiated"}

async def get_local_ai_insight(cpu, mem, proc_name):
    if cpu > 80:
        return f"CRITICAL: Process runaway detected in '{proc_name}'."
    elif mem > 90:
        return "WARNING: Memory saturation. System performance may degrade."
    else:
        return "System operating within nominal parameters. No action required."

async def consume():
    consumer = AIOKafkaConsumer(
        'system-vitals',
        bootstrap_servers='localhost:9092',
        group_id="brain-group"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            data = json.loads(msg.value)
            proc_name = await get_top_process()
            ai_insight = await get_local_ai_insight(data['cpu'], data['memory'], proc_name)
            
            latest_stats.update({
                "cpu": round(data['cpu'], 2),
                "memory": round(data['memory'], 2),
                "ai_analysis": ai_insight,
                "top_process": proc_name
            })
    finally:
        await consumer.stop()

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume())

@app.get("/status")
async def get_status():
    return latest_stats